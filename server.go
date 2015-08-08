package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Song struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
	Id          string `json:"id"`
}

type Queue struct {
	Queue []Song `json:"queue"`
}

var queue = Queue{[]Song{
	{"The second title",
		"What a description",
		"https://i.ytimg.com/vi/B7vFWy8NxIU/default.jpg",
		"B7vFWy8NxIU"},
	{"This is a title",
		"What a description",
		"https://i.ytimg.com/vi/G22X5X49VhM/default.jpg",
		"G22X5X49VhM"},
}}

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

	log.Println("Server started: http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func get_queue(w http.ResponseWriter, r *http.Request) {
	log.Println("Get queue called")
	json_response, err := json.Marshal(queue)
	if err != nil {
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
	var new_songs Queue
	err := decoder.Decode(&new_songs)
	if err != nil {
		log.Fatalln(err)
	}
	log.Println(new_songs)
	w.Write([]byte("success"))
}
