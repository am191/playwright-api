import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker' //generates random data
import { API_KEY, API_TOKEN } from '../auth';
import { boardId, progressListId, testListId, cardNames, testCardId } from '../elementIDs';

const ROUTE = 'https://api.trello.com/1'

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


test.describe('Card API tests', async() => {
  let createCardBody

  test('Get cards for a list', async({request}) => {
      const getCards = await request.get(ROUTE+`/lists/${progressListId}/cards`, {
          params: {
              'key':API_KEY,
              'token':API_TOKEN
          }
      })

      console.log(await getCards.json())
      expect(getCards.ok()).toBeTruthy()
  })

  test('Create and delete new card', async({request}) => {
      const createCard = await request.post(ROUTE+'/cards', {
          headers: {
              "Accept": "application/json"
          },
          params: {
              'key':API_KEY,
              'token':API_TOKEN,
              'idList': testListId,
              'name':cardNames[0]
          }
      })
      createCardBody = await createCard.json()
  
      expect(createCard.ok()).toBeTruthy()
      expect(createCardBody.name).toBe(cardNames[0])
      expect(createCardBody.idList).toBe(testListId)

      //delete created card
      const deleteCard = await request.delete(ROUTE+`/cards/${createCardBody.id}`, {
          params: {
              'key':API_KEY,
              'token':API_TOKEN
          }
      })
  
      expect(deleteCard.ok()).toBeTruthy()
  })
  
  test('Edit card name and description', async({request}) => {
      const randomText = faker.lorem.sentence()

      const editCard = await request.put(ROUTE+`/cards/${testCardId}`, {
          params: {
              'key':API_KEY,
              'token':API_TOKEN,
              'name': timestamp,
              'desc':randomText
          }
      })
      const editCardBody = await editCard.json()

      expect(editCard.ok()).toBeTruthy()
      expect(editCardBody.name).toBe(timestamp)
      expect(editCardBody.desc).toBe(randomText)
  })
      
})