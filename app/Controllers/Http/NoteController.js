'use strict'

const Note = use('App/Models/Note');
const Database = use('Database');
const DetailNote = use('App/Models/DetailNote');

class NoteController {
    async index ({ response }) {
        try {
            let notes = await Note.query()
                                  .with('detail_notes')
                                  .with('users')
                                  .orderBy('created_at', 'desc').fetch()
            return response.json(notes)
        } catch (err) {
            return {
                status: "Something went wrong",
                message: err.message
            }
        }
    }

    async lastid ({ response }) {
        try {
            let notesid = await Database.select('id').from('notes')
                                  .orderBy('created_at', 'desc').limit(1)
            return response.json(notesid)
        } catch (err) {
            return {
                status: "Something went wrong",
                message: err.message
            }
        }
    }

    async store ({request, response}) {
        try {
            const noteData = request.only(['user_id', 'title', 'audio'])
            const note = await Note.create(noteData)
            const detailNoteData = new DetailNote(request.only(['notes_id' ,'generate_id', 'text']))
            await detailNoteData.save()

            return response.status(201).json(note)
        } catch (err) {
            return {
                status: "Failed...",
                message: err.message
            }
        }
    }

    async show ({params, response}) {
        try {
            const note = await Note.find(params.id)
            return response.json(note)
        } catch (err) {
            return {
                status: "Something went wrong",
                message: err.message
            }
        }
    }

    async update ({params, request, response}) {
        try {
            const noteData = request.only(['title', 'detail_notes_id', 'audio'])
            const note = await Note.find(params.id)

            if (!note) {
                return response.status(404).json({data: 'Resource not found'})
            }

            note.title = noteData.title
            note.note = noteData.note
            note.image = noteData.image
            note.audio = noteData.audio

            await note.save()
            return response.status(200).json(note)
        } catch (err) {
            return {
                status: "Failed...",
                message: err.message
            }
        }
    }

    async delete ({params, response}) {

        try {
            const note = await Note.find(params.id)
            await note.delete()
            return response.status(200).json({message: "Successfully deleted the product"})
        } catch (err) {
            return {
                status: "Failed...",
                message: err.message
            }
        }

    }
}

module.exports = NoteController
