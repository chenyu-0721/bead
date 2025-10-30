// api.js
import axios from 'axios'

const api = axios.create({
	baseURL: '/api',
	withCredentials: true, // 重要：讓 cookie 帶上 refresh token
})

api.interceptors.request.use(config => {
	const token = localStorage.getItem('accessToken')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

let isRefreshing = false
let subscribers = []
const subscribe = cb => subscribers.push(cb)
const notifyAll = token => {
	subscribers.forEach(cb => cb(token))
	subscribers = []
}

api.interceptors.response.use(
	res => res,
	async error => {
		const { config, response } = error
		if (response?.status !== 401 || config._retry) return Promise.reject(error)

		config._retry = true

		if (isRefreshing) {
			return new Promise(resolve => {
				subscribe(token => {
					config.headers.Authorization = `Bearer ${token}`
					resolve(api(config))
				})
			})
		}

		isRefreshing = true
		try {
			const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true })
			const newToken = data.accessToken
			localStorage.setItem('accessToken', newToken)
			notifyAll(newToken)
			config.headers.Authorization = `Bearer ${newToken}`
			return api(config)
		} catch (e) {
			localStorage.removeItem('accessToken')
			window.location.href = '/login'
			return Promise.reject(e)
		} finally {
			isRefreshing = false
		}
	},
)

export default api
