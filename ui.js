class FlightArea {
    constructor() {
        this.size = null
        this.thunders = null
        this.shuffled_cells = null
        this.flags = 0
        this.colors = ['#48f542', '#ecf542', '#f5c242', '#f58442', '#f54242', '#000']
        this.steps = [1, 2, 3, 4, 5]
    }

    create_board(size, thunders) {
        document.documentElement.style.setProperty('--size', size)
        this.size = size
        this.thunders = thunders
        this.flags = 0

        const flight_area = document.querySelector('.flight-grid')
        flight_area.innerHTML = ''

        const thunder_cells = Array(thunders).fill('thunder')
        const sunny_cells = Array(size**2 - thunders).fill('sunny')
        const all_cells = thunder_cells.concat(sunny_cells)

        this.shuffled_cells = all_cells.sort(() => Math.random() - 0.5)

        for (let i=0; i<size**2; i++) {
            const cell = document.createElement('div')
            cell.dataset.id = i
            flight_area.appendChild(cell)

            cell.addEventListener('click', () => {
                this.check_clicked_cell(cell)
            })
            cell.oncontextmenu = (e) => {
                // mouse right click event
                this.mark_cell(cell)
                e.preventDefault()
            }
        }
        if (document.querySelector('.legend') === null) {
            this.display_legend()
        }
    }

    mark_cell(clicked_cell) {
        /**(Un)Marks cell on right click as potential field with 'thunder'.*/
        if (!clicked_cell.classList.contains('flaged')) {
            if (!clicked_cell.classList.contains('checked') &&
                this.flags < this.thunders) {
                // Not `checked` and still some `flags` left to use
                clicked_cell.classList.add('flaged')
                this.flags++
                this.is_winner()
            }
        }
        else {
            clicked_cell.classList.remove('flaged')
            this.flags--
        }
    }

    check_clicked_cell(clicked_cell) {
        /**Informs about weather around clicked cell.*/
        let cell_id = parseInt(clicked_cell.dataset.id)
        let cell_weather = this.shuffled_cells[cell_id]

        if (cell_weather === 'thunder') {
            this.game_over(cell_weather)
            return null
        }

        if (clicked_cell.classList.contains('checked') ||
            clicked_cell.classList.contains('flaged')) {
            // Don't make action on marked or already checked cell:
            return null
        }

        let thunders = this.count_thunders_around(cell_id)
        if (thunders !== 0) {
            this.display_plane(clicked_cell, thunders)
            clicked_cell.classList.add('checked')
        }
        else {
            this.display_sun(clicked_cell)
            clicked_cell.classList.add('checked')
            this.check_neighbours(cell_id)
        }
        return null
    }

    check_neighbours(clicked_cell_id) {
        /**Clicks neighbours of previously clicked cell.*/
        let neighbours_id = this.get_valid_neighbours(clicked_cell_id)

        neighbours_id.forEach(id => {
            let next_cell = document.querySelector(`div[data-id="${id}"]`)
            setTimeout(() => next_cell.dispatchEvent(new Event('click')), 20)
        })
    }

    is_winner() {
        /**Verifies if all 'thunders' were 'flaged' correctly.*/
        if (this.flags === this.thunders) {
            let all_matches = Array.from(
                document.querySelectorAll('.flaged')
            )

            all_matches = all_matches.map(cell => {
                return this.shuffled_cells[parseInt(cell.dataset.id)] === 'thunder'
            })

            if (all_matches.every(flag => flag === true)) {
                swal.fire({
                    title: 'Congratulations',
                    text: 'You avoid all thunders and safetly reach destination!'
                })
                this.show_message('WINNER!', 'alert-success')
                this.show_thunders()
            }
        }
    }

    game_over(cell_weather, message) {
        /**Manages scenario when user chooses cell with 'thunder'. Game over.*/
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Game Over!',
        })
        this.show_thunders()
        this.show_message('GAME OVER', 'alert-danger')
        this.block_flight_area()
        return null
    }

    display_thunder() {
        const span = document.createElement('span')
        span.className = 'fa-stack fa-lg'
        span.innerHTML = `
            <i class="fa fa-cloud fa-stack-1x"></i>
            <i class="fa fa-bolt fa-stack-1x" style="color: yellow;"></i>
        `
        return span
    }

    display_plane(cell, thunders) {
        let color = this.get_plane_color(thunders)
        cell.innerHTML = `
            <i class="fa fa-plane" style="color: ${color};"></i>
        `
    }

    display_sun(cell) {
        cell.innerHTML = `
            <i class="fa fa-sun-o fa-inverse" style="color: #fcffb3;"></i>
        `
    }

    display_legend() {
        /**Generates legend for number of `thunders` around and plane color.*/
        const legendDiv = document.createElement('div')
        legendDiv.className = 'legend'

        this.colors.forEach((color, index) => {
            const colorDiv = document.createElement('div')
            colorDiv.appendChild(document.createTextNode(index+1))
            colorDiv.style.background = color

            legendDiv.appendChild(colorDiv)
        })
        document.querySelector('.nav-panel').insertAdjacentElement(
            'afterbegin', legendDiv
        )
    }

    show_thunders() {
        /**Makes all 'thunders' visible.*/
        this.shuffled_cells.forEach((weather, index) => {
            if (weather === 'thunder') {
                let thunder_cell = document.querySelector(`div[data-id="${index}"]`)
                thunder_cell.className = 'thunder'
                // thunder_cell.appendChild(this.display_thunder())
            }
        })
    }

    block_flight_area() {
        document.querySelectorAll('.flight-grid div').forEach(div => {
            div.classList.add('disabled')
        })
    }

    unblock_flight_area() {
        document.querySelectorAll('.flight-grid .disabled').forEach(cell => {
            cell.classList.remove('disabled')
        })
    }

    count_thunders_around(idx) {
        /**Counts number of thunders arround current position.*/
        let thunders = 0

        let valid_neighbours = this.get_valid_neighbours(idx)
        valid_neighbours.forEach(field_id => {
            if (this.shuffled_cells[field_id] === 'thunder') thunders++
        })

        return thunders
    }

    get_valid_neighbours(idx) {
        /**Returns all direct neighbours' ID of given 'cell'.*/
        let clicked_coord_r = Math.floor(idx / this.size),
            clicked_coord_c = idx % this.size

        let neighbours_to_check = [
              idx-1, idx+1, idx+this.size, idx-this.size, idx+this.size+1,
              idx+this.size-1, idx-this.size-1, idx-this.size+1
        ]
        let valid_neighbours = neighbours_to_check.filter(id => {
            let coord_r = Math.floor(id / this.size),
                coord_c = id % this.size

            if (coord_r < 0 || coord_r >= this.size ||
                coord_c < 0 || coord_c >= this.size) {
                // Skip cell outside 'game area':
                return false
            }
            if (Math.abs(clicked_coord_r-coord_r)**2 +
                Math.abs(clicked_coord_c-coord_c)**2 > 2) {
                // Skip ID with distance more than 1 from `clicked cell`:
                return false
            }
            return true
        })
        return valid_neighbours
    }

    show_message(text, type) {
        let infoDiv = document.querySelector('.info-panel')
        infoDiv.innerText = text
        infoDiv.classList.add(type)
        setTimeout(() => {
            infoDiv.innerText = ''
            infoDiv.classList.remove(type)
        }, 5000)
    }

    get_plane_color(thunders) {
        /**Determines plane color depending on number of thunders around.*/
        let idx = this.steps.findIndex(step => step >= thunders)
        return this.colors[idx < 0 ? this.steps.length : idx]
    }
}
