const REVIEWS_API_URL = "https://api.citygridmedia.com/content/reviews/v2/search/where";
const PUBLISHER_CODE = "10000022998";
const LOADING_MESSAGE = ["Asking for opinions", "Knocking on doors", "Checking out the business", "Testing the service", "Sampling the product"]



//Ajax request to citygrid reviews endpoint
function retrieveReviewsAPI(location, businessType, callback){
	const settings = {
		url: REVIEWS_API_URL,
		beforeSend: function(){$('.loading-message').css("visibility", "visible");},
		data:{
			where: `${location}`,
			what: `${businessType}`,
			days: 1800,
			rpp: 12,
			format: 'json', 
			sort: 'createdate',
			publisher: PUBLISHER_CODE
		},
		type: 'GET',
		dataType: 'jsonp',
		timeout: 3000,
		complete: function(){$('.loading-message').css("visibility", "hidden");},
		success: callback,
    	error: displayErrorMessage
	};
	$.ajax(settings);
}

//displays a random message while the request is loading
function randomMessage(){
	let rand = Math.floor(LOADING_MESSAGE.length*Math.random());
	let randMessage = LOADING_MESSAGE[rand];
	$('.waiting-message').html(randMessage);
}

//If the request displays an error, display the error message
//If the request returns no results, display the not found message
//Otherwise, amend the results to js-reivews-results
function displayReviews(data){
	let lat = data.results.regions[0].latitude;
   	let lng = data.results.regions[0].longitude;

  	if (data.results === undefined){
  		displayErrorMessage();
    	}else{
  			const reviews = data.results.reviews.map((item, index) =>
  			renderReviews(item, lat, lng));
			if(reviews.length === 0){
    			displayNotFound();}
  			else {

  				$('.js-reviews-results').html(reviews);}
  				$('html, body').animate({
       			 scrollTop: $(".js-reviews-results").offset().top
    				}, 2000);
  			}
}

function displayErrorMessage(){
  const errorMessage = `
    <div class="each-review error-message review-info">
      <h2 class="error-heading">Something's not right...</h2>
      <p>Something went wrong with the search! Would you like to try again? Or start another with another search?<p>
      <p class="review-author">Sincerely Sorry</p>
    </div>`;
    $('.js-reviews-results').html(errorMessage); 
}

function displayNotFound(){
  const notFoundMessage = `
    <div class="each-review error-message review-info">
      <h2 class="error-heading">I have bad news</h2>
      <p>We couldn't find any reviews for that search. Try using different wording or a broader location.<p>
      <p class="review-author">Very Apologetic</p>
    </div>`;
    $('.js-reviews-results').html(notFoundMessage); 
}

//When the results are published, an onclick event is setup to view Google map results and the original review data
function renderReviews(results, latitude, longitude){
	businessName = results.business_name
	bName = businessName.split("'").join("&#8217;");
	return`
		<div class="each-review">
			<div class="review-info">
				<h2 class="review-business-name">${results.business_name}</h2>
				<blockquote class="review-text">${results.review_text}</blockquote>
				<p class="review-author">${results.review_author}</p>
			</div>
			<div class="more-information">
				<a class="google-info" onclick="displayGoogleInfo('${latitude}','${longitude}','${bName}')" aria-label="map of ${businessName} location" href="#"><img src="http://carenkeyes.com/wp-content/uploads/2018/04/icons8-google-maps-50.png" alt="Google maps business information"/></a>
				<a class="source-logo" onclick="displayReviewSite('${results.review_url}')" aria-label='original review of${businessName}' href="#"><img src="${results.attribution_logo}" alt="original review"/></a>
 			</div>
 		</div>`;
}


//This opens a lightbox and displays the website of the original review in an iframe
function displayReviewSite(review){
	$('.review-display').show();
	$('.map-info').hide();
	displayLightbox();
	displayWaiting();
	displayURL(review);
	let display = `<iframe class="original-review" src=${review}></iframe>`
	$('.review-source').html(display);
	console.log('display');
	setTimeout(displayNotShown, 3000);
}

function displayWaiting(){
	let waitToLoad = `<div class="info"><h2>Computers are talking...</h2>
							<div><img src="http://carenkeyes.com/wp-content/uploads/2018/04/16.gif"></div>
					  </div>`
	$('.message').html(waitToLoad);
}

//After three seconds, this changes the waiting message to an error message. If the site does load, it covers this message
function displayNotShown(){
	let notShown = `<div class="info"><h2 class="error-heading">Well, that's embarassing</h2>
						<p>This page can't be accessed from here. Try clicking the link below to open it in a new tab</p>
					</div>`
	$('.message').html(notShown);
}

//This allows users to open the review source in a new tab, also providing a failsafe if the site doesn't load
function displayURL(url){
	let disUrl = `<div><a class="open-new-tab" href=${url} target="_blank">Open the review site in a new tab</a></div>`
	$('.review-url').html(disUrl);
}

//The next section searches for the business name in the Google Maps API and displays it to the user in a lightbox
function displayGoogleInfo(lat, lng, bName){
	let latitude = parseFloat(lat);
	let longitude = parseFloat(lng);
	initializeLightbox(latitude, longitude, bName);
	displayLightbox();
}

let map;

function initializeLightbox(lat, lng, bName){
	mapHeader(bName);
	$('.map-info').show();
	$('.review-display').hide();

	let local = {lat: lat, lng: lng};
	map = new google.maps.Map(document.getElementById('map'), {
  		center: local,
  		zoom: 11
	});
	let service = new google.maps.places.PlacesService(map);
	service.textSearch({
		location: local,
		radius: 500,
      	query: bName}, 
    sortMarker);
}

function mapHeader(bName){
	let header = `<h2>Search results for ${bName}</h2>`
	$('.map-label').html(header);
}

function sortMarker(results, status){
	 if (status === google.maps.places.PlacesServiceStatus.OK) {
	 	for(let i=0; i<results.length; i++){
	 		createMarker(results[i]);
	 	}     
  }
}

function createMarker(place){
	let marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	let infowindow = new google.maps.InfoWindow();
	let business_info = `
		<p class = "mapName">${place.name}</p>
		<p>${place.formatted_address}</p>`
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(business_info);
		infowindow.open(map, this);
	})
}


//opening and closing the lightbox
let lastFocus;

function displayLightbox(){
  $('.overlay').addClass('active');
  lastFocus = document.activeElement;
  $('.lightbox').focus;
  $('main').prop('hidden', true)
}

function hideLightbox(){
  console.log("hide lightbox ran");
  $('.overlay').removeClass('active');
  $('main').prop('hidden', false)
  lastFocus.focus();
  $('html, body').animate({
    scrollTop: $(".js-reviews-results").offset().top
    });
}

//Event handlers
function escKeyHandler(){
  $(document).on('keyup', function(event){
    if (event.keyCode == 27){
      hideLightbox();
    }
  });
}

function focusHandler(){
	$('.js-reviews-results').on('focus', '.google-info', function(e){
		$(this).closest('div').addClass('show-info')
		;})	
	$('.js-reviews-results').on('focus', '.source-logo', function(e){
		$(this).closest('div').addClass('show-info')
		;})		
}

function focusOutHandler(){
	$('.js-reviews-results').on('focusout', '.google-info', e =>{
		$('.more-information').removeClass('show-info');})	
	$('.js-reviews-results').on('focusout', '.source-logo', e =>{
		$('.more-information').removeClass('show-info');})	
}


function handleSearchForm(){
	$('.js-search-form').submit(event => {
	  event.preventDefault();
		let location = $(event.currentTarget).find('.js-location').val();
		let businessType = $(event.currentTarget).find('.js-business-type').val();
		$(event.currentTarget).find('.js-business-type').val("");
		retrieveReviewsAPI(location, businessType, displayReviews);
		randomMessage();
	});
}

focusHandler();
focusOutHandler();
handleSearchForm();
escKeyHandler();
