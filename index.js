const REVIEWS_API_URL = "https://api.citygridmedia.com/content/reviews/v2/search/where";
const PUBLISHER_CODE = "10000022998";
//const KEY = "AIzaSyClCuqyZIVyyddaalXsUzTGY02oIiuideQ";
//let location;
const LOADING_MESSAGE = ["Asking for opinions", "Knocking on doors", "Checking out the business", "Testing the service", "Sampling the product"]

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 36, lng: 150},
    zoom: 8
  });
}

function handleSearchForm(){
	//console.log("handle search form ran");
	$('.js-search-form').submit(event => {
	  event.preventDefault();
		//let location = $(event.currentTarget).find('.js-location').val();
		let businessType = $(event.currentTarget).find('.js-business-type').val();
		//console.log(location);
		//console.log(businessType);
		let location = getLocation();
		$(event.currentTarget).find('.js-business-type').val("");
		retrieveReviewsAPI(location, businessType, displayReviews);
		randomMessage();
	});
}

function handleBusinessInfo(){
	$('.each-review').click(handleLightbox);
}

function randomMessage(){
	let rand = Math.floor(LOADING_MESSAGE.length*Math.random());
	//console.log(rand);
	let randMessage = LOADING_MESSAGE[rand];
	//console.log(randMessage);
	$('.waiting-message').html(randMessage);
}

function getLocation(){
  let location = $('.js-search-form').find('.js-location').val();
  //console.log(location);
  return location;
}

function retrieveReviewsAPI(location, businessType, callback){
	//console.log("retrieve reviews api ran");
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
    	//error: displayErrorMessage()
	};
	$.ajax(settings);
}

function displayReviews(data){
	    let lat = data.results.regions[0].latitude;
    	let lng = data.results.regions[0].longitude;
    	console.log(lat);
    	console.log(lng);
  		console.log(data);
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
    <div class="each-review error-message">
      <h2 class="error-heading">Something's not right...</h2>
      <p>Something went wrong with the search! Would you like to try again? Or start another with another search?<p>
      <p class="review-author">Sincerely Sorry</p>
    </div>`;
    $('.js-reviews-results').html(errorMessage); 
}

function displayNotFound(){
  const notFoundMessage = `
    <div class="each-review error-message">
      <h2 class="error-heading">I have bad news</h2>
      <p>We couldn't find any reviews for that search. Try using different wording or a broader location.<p>
      <p class="review-author">Very Apologetic</p>
    </div>`;
    $('.js-reviews-results').html(notFoundMessage); 
}

function renderReviews(results, latitude, longitude){
	//console.log("render reviews ran");
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

function displayReviewSite(review){
	$('.review-source').show();
	$('#map').hide();
	displayLightbox();
	let display = `<iframe class="original-review" src=${review}></iframe>`
	console.log(display);
	$('.review-source').html(display);
}

function displayGoogleInfo(lat, lng, bName){
	let latitude = parseFloat(lat);
	let longitude = parseFloat(lng);
	initializeLightbox(latitude, longitude, bName);
	displayLightbox();
}

let map;
//let marker;

function initializeLightbox(lat, lng, bName){
	$('#map').show();
	$('.review-source').hide();

	let local = {lat: lat, lng: lng};

	map = new google.maps.Map(document.getElementById('map'), {
  		center: local,
  		zoom: 11
	});

	//let infowindow = new google.maps.InfoWindow();
	let service = new google.maps.places.PlacesService(map);

	service.textSearch({
		location: local,
		radius: 500,
      	query: bName}, 
    callback);
}

function callback(results, status){
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
	})

	let infowindow = new google.maps.InfoWindow();

	let business_info = `
		<p class = "mapName">${place.name}</p>
		<p>${place.formatted_address}</p>`

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(business_info);
		infowindow.open(map, this);
	})
}

function handleLightbox(data){
  console.log("handle lightbox ran");
  displayLightbox();}

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

function escKeyHandler(){
  $(document).on('keyup', function(event){
    if (event.keyCode == 27){
      hideLightbox();
    }
  });
}

function focusHandler(){
	$('.js-reviews-results').on('focus', '.google-info', e =>{
		console.log('handler ran')
		let target = e.target.closest('div');
		console.log(target)
		$('target').addClass('show-info')
		;})	
	$('.js-reviews-results').on('focus', '.source-logo', e =>{
		console.log('handler ran')
		$('.more-information').addClass('show-info');})	
}

function focusOutHandler(){
	$('.js-reviews-results').on('focusout', '.google-info', e =>{
		console.log('handler ran')
		$('.more-information').removeClass('show-info');})	
	$('.js-reviews-results').on('focusout', '.source-logo', e =>{
		console.log('handler ran')
		$('.more-information').removeClass('show-info');})	
}

focusHandler();
focusOutHandler();
handleSearchForm();
escKeyHandler();
handleBusinessInfo();
//handleCloseLightbox();