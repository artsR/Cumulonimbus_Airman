const {remote} = require('electron')



const flight_grid = new FlightArea()
const new_game = document.querySelector('#new-game')
const weather = document.querySelector('#weather')
const flight_area = document.querySelector('#flight-area')

const overcast_level = [0.1, 0.15, 0.2, 0.25]


document.addEventListener('DOMContentLoaded', () => {
    let size = 10
    let thunders = Math.round(overcast_level[2] * size**2)

    flight_grid.create_board(size, thunders)
})

document.querySelector('#close').addEventListener('click', () => {
    let win = remote.getCurrentWindow()
    win.close()
})

new_game.addEventListener('click', () => {
    let weather = document.querySelector('#weather img.active').dataset.weather
    let overcast = overcast_level[parseInt(weather)]
    let size = parseInt(flight_area.querySelector('input').value)
    let thunders = Math.round(overcast * size**2)

    // Adapt 'font-size' to 'cell' size:
    document.querySelector('.flight-grid').style.fontSize = `${26 - (size-10)*1.5}px`
    flight_grid.create_board(size, thunders)
})

weather.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        weather.querySelectorAll('img').forEach(img => {
            img.classList.remove('active')
        })
        e.target.classList.add('active')
    }
})
