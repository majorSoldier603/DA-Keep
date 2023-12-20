import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class NoteListService {

	trashNotes: Note[] = [];
	normalNotes: Note[] = [];
	normalMarkedNotes: Note[] = [];
	unsubTrash;
	unsubNotes;
	unsubMarkedNotes;

	firestore: Firestore = inject(Firestore);

	constructor() {
		this.unsubTrash = this.subTrashList();
		this.unsubNotes = this.subNotesList();
		this.unsubMarkedNotes = this.subMarkedNotesList();
	}

	async deleteNote(colId: "notes" | "trash", docId: string) {
		await deleteDoc(this.getSingleNoteRef(colId, docId)).catch(
			(err) => { console.error("Error removing document: ", err); }
		).then(
			() => { console.log("Document successfully removed!"); }
		);
	}

	async updateNote(note: Note) {
		if (note.id) {
			let docRef = this.getSingleNoteRef(this.getColIdFromNote(note), note.id)
			await updateDoc(docRef, this.getCleanJson(note)).catch(
				(err) => { console.error("Error updating document: ", err); }
			).then(
				() => { console.log("Document successfully updated!"); }
			);
		}
	}

	getCleanJson(note: Note) {
		return {
			type: note.type,
			title: note.title,
			content: note.content,
			marked: note.marked
		}
	}

	getColIdFromNote(note: Note) {
		if (note.type == "note") {
			return "notes";
		} else {
			return "trash";
		}
	}

	async addNote(item: Note, colId: "notes" | "trash") { 
		if (colId == "notes") {
			await addDoc(this.getNotesRef(), item).catch(
				(err) => { console.error("Error adding document to collection Note: ", err); }
			).then(
				() => { console.log("Document successfully added to collection Note!"); }
			);
		} else {
			await addDoc(this.getTrashRef(), item).catch(
				(err) => { console.error("Error adding document to collection Trash: ", err); }
			).then(
				() => { console.log("Document successfully added to collection Trash!"); }
			);
		}
		
	}

	ngonDestroy() {
		this.unsubTrash();
		this.unsubNotes();
		this.unsubMarkedNotes();
	}

	subTrashList() {
		const q = query(this.getTrashRef(), orderBy("title"), limit(100));
		return onSnapshot(q, (list) => {
			this.trashNotes = [];
			list.forEach(element => {
				this.trashNotes.push(this.setNoteObjet(element.data(), element.id));
			});
			list.docChanges().forEach((change) => {
				if (change.type === "added") {
					console.log("New note: ", change.doc.data());
				}
				if (change.type === "modified") {
					console.log("Modified note: ", change.doc.data());
				}
				if (change.type === "removed") {
					console.log("Removed note: ", change.doc.data());
				}
			});
		}, (error) => {
			console.log("Error getting documents subTrashList: ", error);
			});
	}

	subNotesList() {
		const q = query(this.getNotesRef(), where("marked", "==", false), limit(100));
		return onSnapshot(q, (list) => {
			this.normalNotes = [];
			list.forEach(element => {
				this.normalNotes.push(this.setNoteObjet(element.data(), element.id));
			});
			list.docChanges().forEach((change) => {
				if (change.type === "added") {
					console.log("New note: ", change.doc.data());
				}
				if (change.type === "modified") {
					console.log("Modified note: ", change.doc.data());
				}
				if (change.type === "removed") {
					console.log("Removed note: ", change.doc.data());
				}
			});
		}, (error) => {
			console.log("Error getting documents subNotesList: ", error);
		});
	}

	subMarkedNotesList() {
		const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
		return onSnapshot(q, (list) => {
			this.normalMarkedNotes = [];
			list.forEach(element => {
				this.normalMarkedNotes.push(this.setNoteObjet(element.data(), element.id));
			});
			list.docChanges().forEach((change) => {
				if (change.type === "added") {
					console.log("New note: ", change.doc.data());
				}
				if (change.type === "modified") {
					console.log("Modified note: ", change.doc.data());
				}
				if (change.type === "removed") {
					console.log("Removed note: ", change.doc.data());
				}
			});
		}, (error) => {
			console.log("Error getting documents subMarkedNotesList: ", error);
		});
	}

	setNoteObjet(obj: any, id: string): Note {
		return {
			id: id,
			type: obj.type || "note",
			title: obj.title || "",
			content:obj.content || "",
			marked: obj.marked || false
		}
	}

	getNotesRef() {
		return collection(this.firestore, 'notes');
	}

	getTrashRef() {
		return collection(this.firestore, 'trash');
	}

	getSingleNoteRef(colId:string, docId:string) {
		return doc(collection(this.firestore, colId), docId);
	}
}
