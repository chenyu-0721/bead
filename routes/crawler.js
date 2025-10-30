const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

router.get('/', async (req, res, next) => {
	try {
		const url = 'https://hdps.cwa.gov.tw/static/state.html#existing_station'
		const browser = await puppeteer.launch({ headless: true })
		const page = await browser.newPage()
		await page.goto(url, { waitUntil: 'networkidle0' })

		const data = await page.evaluate(() => {
			const rows = []
			const el = document.querySelector('body')
			if (!el) return rows
			const text = el.innerText
			const lines = text.split('\n')
			let inSection = false
			for (let line of lines) {
				line = line.trim()
				if (!inSection) {
					if (line.startsWith('一、現存測站')) inSection = true
					continue
				}
				if (line.startsWith('二、現存測站')) break
				if (line.startsWith('站號')) continue
				if (!line) continue

				const parts = line.split(/\s+/)
				if (parts.length < 8) continue
				const [
					stationId,
					stationName,
					stationType,
					altitude,
					longitude,
					latitude,
					city,
					...addr
				] = parts
				rows.push({
					stationId,
					stationName,
					stationType,
					altitude,
					longitude,
					latitude,
					city,
					address: addr.join(' '),
				})
			}
			return rows
		})

		await browser.close()
		res.json(data)
	} catch (err) {
		next(err)
	}
})

module.exports = router
