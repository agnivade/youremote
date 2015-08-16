package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/Workiva/go-datastructures/queue"
)

type Song struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
	Id          string `json:"id"`
}

type JSONQueue struct {
	Queue []Song `json:"queue"`
}

// This is the queue that will hold all the songs in memory
var songQueue = queue.New(100)

func main() {
	// Setting the log flags
	log.SetFlags(log.Ltime | log.Lshortfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Returning the static files
	http.Handle("/", http.FileServer(http.Dir("./public")))

	// Setting up handlers for individual routes
	http.HandleFunc("/get_queue", get_queue)
	http.HandleFunc("/push_data", push_data)

	//Starting the goroutine which will loop over songs
	go loopSongs()

	log.Println("Server started: http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func get_queue(w http.ResponseWriter, r *http.Request) {
	log.Println("Get queue called")

	log.Println("Length of queue is -", songQueue.Len())
	// Retreiving all the songs
	song_items, err := songQueue.Get(songQueue.Len())
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Putting them back again because I have no way to just read the
	// songs without taking them from the queue
	// XXX: There is only one race condition here- while doing this taking out
	// and in operation, some other request might add other songs and this might
	// change the song order in the queue
	for _, song := range song_items {
		err = songQueue.Put(song)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Converting the song queue to json and sending
	json_response, err := json.Marshal(song_items)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Write(json_response)
}

func push_data(w http.ResponseWriter, r *http.Request) {
	log.Println("Push data called")
	decoder := json.NewDecoder(r.Body)
	var new_songs JSONQueue
	// Decoding the json into a struct
	err := decoder.Decode(&new_songs)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Pushing the songs to the queue
	for _, song := range new_songs.Queue {
		err = songQueue.Put(song)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	log.Println(new_songs)
	// Sending the response
	w.Write([]byte("success"))
}

func loopSongs() {
	// check if song is already playing (XXX: This is no longer needed
	// because we are playing the songs synchronously)
	// if not, then get the top item from queue and start playing it
	// if yes, sleep
	// loop
	for {
		if songQueue.Len() > 0 {
			// Getting the song
			song_queue, err := songQueue.Get(1)
			if err != nil {
				log.Println(err)
				continue
			}
			song, ok := song_queue[0].(Song)
			if !ok {
				log.Println("Conversion from interface to struct failed")
				break
			}
			log.Println(song.Id)
			// Constructing the video url
			video_url := "https://www.youtube.com/watch?v=" + song.Id
			log.Println(video_url)
			cmd := exec.Command("mpsyt", "playurl", video_url)
			cmdReader, err := cmd.StdoutPipe()
			if err != nil {
				fmt.Fprintln(os.Stderr, "Error creating StdoutPipe for Cmd", err)
				os.Exit(1)
			}

			scanner := bufio.NewScanner(cmdReader)
			go func() {
				for scanner.Scan() {
					fmt.Printf("song output %s\n", scanner.Text())
				}
			}()

			// Start command synchronously
			// XXX: This will work for now but need to change it when we move over
			// to raspberry pi
			log.Println("Starting to play")
			err = cmd.Start()
			if err != nil {
				log.Println(err)
				continue
			}

			err = cmd.Wait()
			if err != nil {
				log.Println(err)
				continue
			}

			log.Println("Song ended")
		} else {
			time.Sleep(2 * time.Second)
		}
	}
}
