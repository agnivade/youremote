package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
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

var songQueue = queue.New(100)

func main() {
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

	song_items, err := songQueue.Get(songQueue.Len())
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = songQueue.Put(song_items)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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
	err = songQueue.Put(new_songs.Queue)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println(new_songs)
	// Sending the response
	w.Write([]byte("success"))
}

func loopSongs() {
	for {
		time.Sleep(2 * time.Second)
		// check if song is already playing
		// if yes, sleep
		// if not, then get the top item from queue and start playing it and store the pid
		// continue
	}
}
