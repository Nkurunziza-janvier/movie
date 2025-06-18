document.addEventListener('DOMContentLoaded', function() {
    // Dark/Light Mode Toggle
    const toggle = document.querySelector('.toggle');
    const toggleBall = document.querySelector('.toggle-ball');
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        toggleBall.classList.toggle('active');
    });

    // API Configuration
    const API_KEY = '6fbf59759e4fb40d0bfd5bcd409b157d'; // Replace with your TMDB API key
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/';
    
    // Featured movie (random from trending)
    async function fetchFeaturedMovie() {
        try {
            const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
            const data = await response.json();
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const featuredMovie = data.results[randomIndex];
            displayFeaturedMovie(featuredMovie);
        } catch (error) {
            console.error('Error fetching featured movie:', error);
        }
    }
    
    function displayFeaturedMovie(movie) {
        const featuredContent = document.getElementById('featured-movie');
        const { title, backdrop_path, overview, id } = movie;
        
        featuredContent.innerHTML = `
            <div class="featured-info">
                <h1 class="featured-title">${title}</h1>
                <p class="featured-desc">${overview}</p>
                <div class="featured-buttons">
                    <button class="featured-button play" onclick="showMovieDetails(${id})">
                        <i class="fas fa-play"></i> Play Now
                    </button>
                    <button class="featured-button info" onclick="showMovieDetails(${id})">
                        <i class="fas fa-info-circle"></i> More Info
                    </button>
                </div>
            </div>
        `;
        
        // Set background image
        featuredContent.style.background = `
            linear-gradient(to right, #141414 20%, transparent),
            url('${IMG_URL}original${backdrop_path}') no-repeat center center/cover
        `;
    }
    
    // Fetch and display movies
    async function fetchMovies(url, elementId) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            showMovies(data.results, elementId);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }
    
    function showMovies(movies, elementId) {
        const movieList = document.getElementById(elementId);
        movieList.innerHTML = '';
        
        movies.forEach(movie => {
            const { title, poster_path, vote_average, overview, id } = movie;
            const movieEl = document.createElement('div');
            movieEl.classList.add('movie-list-item');
            
            movieEl.innerHTML = `
                <img class="movie-list-item-img" src="${IMG_URL}w500${poster_path}" alt="${title}" onclick="showMovieDetails(${id})">
                <span class="movie-list-item-title">${title}</span>
                <p class="movie-list-item-desc">${overview.slice(0, 100)}...</p>
                <button class="movie-list-item-button" onclick="showMovieDetails(${id})">
                    <i class="fas fa-play"></i> Play
                </button>
                <div class="rating-badge">
                    <i class="fas fa-star"></i> ${vote_average.toFixed(1)}
                </div>
            `;
            
            movieList.appendChild(movieEl);
        });
        
        // Add scroll functionality to arrows
        const arrows = document.querySelectorAll('.arrow');
        arrows.forEach(arrow => {
            arrow.addEventListener('click', () => {
                const movieList = arrow.parentElement.querySelector('.movie-list');
                const scrollAmount = arrow.classList.contains('left-arrow') ? -300 : 300;
                movieList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        });
    }
    
    // Show movie details modal
    window.showMovieDetails = async function(movieId) {
        try {
            const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`);
            const movie = await response.json();
            
            const modal = document.getElementById('movie-modal');
            const modalBody = document.getElementById('modal-body');
            
            // Format runtime
            const hours = Math.floor(movie.runtime / 60);
            const minutes = movie.runtime % 60;
            const runtime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            // Get trailer key if available
            let trailerKey = '';
            if (movie.videos && movie.videos.results) {
                const trailer = movie.videos.results.find(vid => vid.type === 'Trailer');
                if (trailer) trailerKey = trailer.key;
            }
            
            modalBody.innerHTML = `
                <img class="modal-movie-poster" src="${IMG_URL}original${movie.backdrop_path}" alt="${movie.title}">
                <div class="modal-movie-content">
                    <h2 class="modal-movie-title">${movie.title}</h2>
                    <div class="modal-movie-info">
                        <div class="modal-movie-rating">
                            <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                        </div>
                        <span class="modal-movie-year">${movie.release_date.slice(0, 4)}</span>
                        <span class="modal-movie-runtime">${runtime}</span>
                    </div>
                    <p class="modal-movie-overview">${movie.overview}</p>
                    <div class="modal-movie-genres">
                        ${movie.genres.map(genre => `<span class="modal-movie-genre">${genre.name}</span>`).join('')}
                    </div>
                    <div class="modal-movie-buttons">
                        <button class="modal-movie-button play" onclick="playTrailer('${trailerKey}')">
                            <i class="fas fa-play"></i> Play Trailer
                        </button>
                        <button class="modal-movie-button list">
                            <i class="fas fa-plus"></i> My List
                        </button>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Close modal when clicking X
            document.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }
    
    // Play trailer (placeholder - would open YouTube in real implementation)
    window.playTrailer = function(trailerKey) {
        if (trailerKey) {
            window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
        } else {
            alert('Trailer not available');
        }
    }
    
    // Initialize the page
    fetchFeaturedMovie();
    fetchMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`, 'trending-movies');
    fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, 'popular-movies');
    fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, 'top-rated-movies');
    fetchMovies(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`, 'upcoming-movies');
    
    // Add TMDB attribution
    const attribution = document.createElement('div');
    attribution.className = 'tmdb-attribution';
    attribution.innerHTML = `
        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" alt="TMDB Logo" width="100">
    `;
    document.body.appendChild(attribution);
    
    // Style the attribution
    const style = document.createElement('style');
    style.innerHTML = `
        .tmdb-attribution {
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 100;
            opacity: 0.7;
            transition: var(--transition);
        }
        
        .tmdb-attribution:hover {
            opacity: 1;
        }
        
        .tmdb-attribution img {
            width: 80px;
            height: auto;
        }
        
        @media (max-width: 768px) {
            .tmdb-attribution img {
                width: 60px;
            }
        }
    `;
    document.head.appendChild(style);
});