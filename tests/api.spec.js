import { test, expect } from '@playwright/test';
//import { faker } from '@faker-js/faker' //generates random data
import { API_KEY, API_TOKEN } from '../auth';

const AUTH = `?key=${API_KEY}&token=${API_TOKEN}` 
const ROUTE = 'https://api.trello.com/1'

//pre-created items
const boardId = '67d803b1fff8c29e7c643862'
const backupBoardId = '67d95c2c31161e1bd66f371a'
const testListId = '67d803b1da81053950f0e3ed'
const progressListId = '67d803b1cc4533f940e123d3'
const testCardId = '67d954972c7cb69cc3e424f4'

const timestamp = new Date().toISOString()
const listName =  `test-${timestamp}`



test.describe('List API tests', async() => {
  test('Create new list to pre-existing board and archive it', async({request}) => {
      const newList = await request.post(ROUTE+'/lists', {
          params: {
          'name': listName,
          'idBoard': boardId,
          'key':API_KEY,
          'token':API_TOKEN
  }})
      const newListBody = await newList.json()
  
      expect(newList.ok()).toBeTruthy()
      expect(newListBody.name).toBe(listName)

      //remove
      const archiveList = await request.put(ROUTE+`/lists/${newListBody.id}/closed`, {
          params: {
              'key':API_KEY,
              'token':API_TOKEN,
              'value': true
          }
      })

      expect(archiveList.ok()).toBeTruthy()
  })
})
