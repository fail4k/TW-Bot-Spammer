const { Client } = require('teeworlds')

const DDNET_VERSION = {
	version: 18,
	release_version: '19.2'
}

// Глобальный массив активных ботов
let activeBots = []

/**
 * Создает и возвращает нового бота (экстремально быстрый режим)
 * @param {string} serverIp - IP сервера
 * @param {number} serverPort - Порт сервера
 * @param {string} nickname - Базовый никнейм бота
 * @returns {Promise<Object>} - Объект бота
 */

async function createBot(serverIp, serverPort, nickname) {
	if (!serverIp || !serverPort) {
		throw new Error('Не указан IP или порт сервера')
	}

	// Генерация случайного суффикса для никнейма
	const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
	const botName = nickname && nickname.trim() !== '' 
		? `${nickname}${randomNum}` 
		: randomNum

	// Экстремально быстрые настройки
	const client = new Client(serverIp, serverPort, botName, {
		identity: {
			name: botName,
			clan: '',
			skin: 'default',
			use_custom_color: 0,
			color_body: 0,  // Устанавливаем фиксированные цвета вместо случайных
			color_feet: 0,  // для ускорения
			country: -1,
		},
		timeout: 500,         // Ещё меньше таймаут
		lightweight: true,    // Обязательно lightweight 
		ddnet_version: DDNET_VERSION,
		retries: 0,           // Без повторных попыток
		retryDelay: 0         // Без задержки
	})

	// Абсолютный минимум для отслеживания состояния
	let isConnected = false

	// Максимально простой обработчик подключения
	client.on('connected', () => {
		isConnected = true
	})

	// Простой обработчик отключения
	client.on('disconnect', () => {
		isConnected = false
	})

	// Добавляем в массив активных ботов
	activeBots.push(client)
	
	// Только минимально необходимый функционал
	client.isConnected = () => isConnected
	
	// Супер-упрощенный sendInput
	if (!client.sendInput) {
		client.sendInput = () => {
			try {
				if (client._sendInput) client._sendInput()
				else if (client.sendInputPacket) client.sendInputPacket({
					direction: 0, target_x: 0, target_y: 0, jump: 0, fire: 0, hook: 0,
					player_flags: 0, wanted_weapon: 0, next_weapon: 0, prev_weapon: 0
				})
			} catch (e) {}
		}
	}
	
	return client
}

/**
 * Отключает всех активных ботов мгновенно
 */
async function disconnectAllBots() {
	// Быстрое отключение без ожиданий и проверок
	const bots = activeBots
	activeBots = []
	
	for (const bot of bots) {
		try { bot.Disconnect() } catch (e) {}
	}
}

module.exports = {
	createBot,
	disconnectAllBots,
}
