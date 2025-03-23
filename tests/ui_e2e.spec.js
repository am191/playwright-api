import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker' //generates random data

const timestamp = new Date().toISOString()

test('User flow for card creation and completion', async({page}) => {
    await test.step('User logs into the Trello application', async() => {
        await page.goto('https://trello.com/b/VMMtj8PS/first-board')

        await expect(page.getByText('Sign up to see this board')).toBeVisible()

        await page.locator('[data-testid="request-access-login-button"]').click()
        await expect(page).toHaveTitle('Log in to continue - Log in with Atlassian account')

        await page.getByPlaceholder('Enter your email').fill(trelloEmail)
        await page.locator('#login-submit').click()
        await expect(page.getByPlaceholder('Enter password')).toBeVisible()
        await page.getByPlaceholder('Enter password').fill(trelloPswrd)
        await page.locator('#login-submit').click()

        await expect(page).toHaveTitle('First board | Trello')

        await page.getByTestId('list-add-card-button').first().waitFor()
    })

    await test.step('User closes menu pop-ups', async() => {
        const closeIcons = await page.getByTestId('CloseIcon').all()

        //closes Get started and Menu pop-ups so they dont interfere with rest of actions
        for (const closeIcon of closeIcons) {
            await closeIcon.click()
        }

        await expect(page.locator('h3', { hasText: 'Menu' })).not.toBeVisible()
    })

    await test.step('User creates new card', async() => {
        await page.getByTestId('list-add-card-button').nth(-1).click()
        await page.getByTestId('list-card-composer-textarea').fill(timestamp)
        await page.getByTestId('list-card-composer-add-card-button').click()

        //assert
        await expect(page.getByTestId('card-name').getByText(timestamp)).toBeVisible()
    })

    await test.step('User attaches file to the card', async({page}) => {
        await page.getByTestId('card-name').getByText(timestamp).click()
        //upload the file
        await page.locator('[data-testid="card-back-attachment-button"]').click()
        await page.locator('#card-attachment-file-picker').setInputFiles('../photo.avif')

        await page.locator('button[type="submit"]').click()

        //assert
        await expect(page.locator('data-testid="attachment-thumbnail-name"', { toHaveText: 'photo.avif' })).toBeVisible()
    })

    await test.step('User adds a new comment for the card', async({page}) => {
        const randomComment = faker.lorem.sentences(3)

        await page.getByPlaceholder('Write a comment…').fill(randomComment)
        await page.locator('data-testid="card-back-comment-save-button"').click()

        await expect(page.locator('data-testid="comment-container"')).first().toHaveText(randomComment)
    })

    await test.step('User drags card to another list', async({page}) => {
        await page.locator('[data-testid="CloseIcon"]').click()

        const draggableElement = page.locator('[data-testid="card-name"]', { toHaveText: timestamp })
        const dropTarget = page.getByLabel('In Progress')

        // Simulate the drag-and-drop action
        await draggableElement.dragTo(dropTarget)

        //assert list change through api call
        const cardsInList = await request.get(ROUTE+`/lists/${progressListId}/cards`,{
            params: {
                'key':API_KEY,
                'token':API_TOKEN
            }
        })
        const cardsInListBody = await cardsInList.json()
        await expect(cardsInListBody[0].name).toBe(timestamp)

    await test.step('User checks off the card', async({page}) => {
        return true
    })
})
})