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
			rpp: 20,
			format: 'json', 
			sort: 'createdate',
			publisher: PUBLISHER_CODE
		},
		type: 'GET',
		dataType: 'jsonp',
		timeout: 3000,
		complete: function(){$('.loading-message').css("visibility", "hidden");},
		success: callback,
    	error: displayErrorMessage()
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
    				}, 2000);}
}

function displayErrorMessage(){
  const errorMessage = `
    <div class="each-review error-message">
      <h2>Uh-oh</h2>
      <p>Something went wrong with the search! Would you like to try again with another search?<p>
      <p class="review-author">Sincerely Sorry</p>
    </div>`;
    $('.js-reviews-results').html(errorMessage); 
}

function displayNotFound(){
  const notFoundMessage = `
    <div class="each-review error-message">
      <h2>Uh-oh</h2>
      <p>We couldn't find any reviews for that search. Would you like to try again?<p>
      <p class="review-author">Very Apologetic</p>
    </div>`;
    $('.js-reviews-results').html(notFoundMessage); 
}

function renderReviews(results, latitude, longitude){
	//console.log("render reviews ran");
return`
		<div class="each-review">
			<h2 class="review-business-name">${results.business_name}</h2>
			<blockquote class="review-text">${results.review_text}</blockquote>
			<p class="review-author">${results.review_author}</p>
			<a class="google-info" onclick="displayGoogleInfo('${latitude}','${longitude}')" href="#">Google</a>
			<a class="review-source" onclick="displayReviewSite('${results.review_url}')" href="#"><img src="${results.attribution_logo}"</a>
 		</div>`;
}

function displayReviewSite(review){
	displayLightbox();
	let display = `<iframe class="original-review" src=${review}></iframe>`
	console.log(display);
	$('.lightbox-data').html(display);
}

function displayGoogleInfo(lat, lng){
	let local = `{lat: ${lat}, lng:${lng}}`
	console.log(local);
	initializeLightbox();
	displayLightbox();
	getPlaceID(local)
}

function initializeLightbox(){
	let lightboxData = `
		<div></div>
		<div id='map'><div>`
	$('.lightbox-data').hmtl(lightboxData);
}

function getPlaceID(local){
	map = new google.maps.Map(document.getElementById('map'), {
  		center: local,
  		zoom: 10
	});


}

function handleLightbox(data){
  console.log("handle lightbox ran");
  displayLightbox();}

function displayLightbox(){
  $('.overlay').addClass('active');
}

function hideLightbox(){
  console.log("hide lightbox ran");
  $('.overlay').removeClass('active');
}

function escKeyHandler(){
  $(document).on('keyup', function(event){
    if (event.keyCode == 27){
      hideLightbox();
    }
  });
}

function handleCloseLightbox(){
  $('.overlay').on('click', function() {
    hideLightbox();
  });
}

handleSearchForm();
escKeyHandler();
handleBusinessInfo();
//handleCloseLightbox();