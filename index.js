const REVIEWS_API_URL = "https://api.citygridmedia.com/content/reviews/v2/search/where";
//const PLACES_API_URL = "https://api.citygridmedia.com/content/places/v2/search/where";
const PUBLISHER_CODE = "10000022998";
//const GOOGLE_MAPS_API = "https://maps.googleapis.com/maps/api/js"
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
	console.log(rand);
	let randMessage = LOADING_MESSAGE[rand];
	console.log(randMessage);
	$('.waiting-message').html(randMessage);
}

function getLocation(){
  let location = $('.js-search-form').find('.js-location').val();
  console.log(location);
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
			//days: 360,
			rpp: 12,
			format: 'json', 
			sort: 'reviewRating',
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
  console.log(data);
  if (data.results === undefined){
  	displayErrorMessage();
    }else{
  const reviews = data.results.reviews.map((item, index) =>
  renderReviews(item));
  console.log(reviews);

	if(reviews.length === 0){
    displayNotFound();
  }
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

function renderReviews(results){
	//console.log("render reviews ran");
return`
		<div class="each-review">
			<a class="review-business-name" onclick="handleLightbox()" href="#">${results.business_name}</a>
			<blockquote class="review-text">${results.review_text}</blockquote>
			<p class="review-author">${results.review_author}</p>
			<a class="review-source" href="${results.review_url}" target="_blank">Original Review</a>
 		</div>`;
}

//for when the API is working
//onclick='retrievePlacesAPI("${results.business_name}")'

function retrievePlacesAPI(businessName){
  console.log("retrieve places api ran");
  //let location = getLocation();
  const settings = {
    url: PLACES_API_URL,
    data: {
      where: location,
      what: businessName,
      format: 'json',
      rpp: 1,
      publisher: PUBLISHER_CODE
    },
    type: 'GET',
    dataType: 'jsonp',
    success: function() {
      alert('Success!');
      handleLightbox();
    },
    error: function() {alert('Failed!')}
  };
  $.ajax(settings);
}


function displayPlaces(data){
  console.log("display places ran");
  let phoneNumber = formatPhoneNumber(data.results.locations.phone_number);
  return`
      <div class="business-info"><div class="business-image"><img src="${data.results.locations.image}"></div>
      <h2 class="review-business-name">${data.results.locations.name}</h2></div>
      <address>
        <p class="street-address">${data.results.locations.address.street}<p>
        <p class="city-state">${data.results.locations.address.city}, ${data.results.locations.address.state} ${data.results.locations.address.postal_code}<p>
        <p class="telephone"><a href="tel:${data.results.locations.phone_number}">${phoneNumber}</a></p>
        <p class="business-site"><a href=${data.results.locations.website} target=_"blank">Visit Website</a></p>
      </address>`;
}

function formatPhoneNumber(number){
  const areaCode = number.slice(0,3);
  console.log(areaCode);
  const phonePrefix = number.slice(3,6);
  console.log(phonePrefix);
  const phoneLastFour = number.slice(6,10);
  console.log(phoneLastFour);
  return `(${areaCode}) ${phonePrefix}-${phoneLastFour}`;
}

function displayMap(data){
  let coords = `"${data.results.locations.latitude},${data.results.locations.longitude}"`
  console.log(coords);
  let businessName = `${data.results.locations.name}`.replace(/[^a-z0-9+]+/gi, '+');
  console.log(businessName);
  let zipCode = `${data.results.locations.address.postal_code}`
  console.log(zipCode)
  console.log(`https://www.google.com/maps/embed/v1/place?key=AIzaSyClCuqyZIVyyddaalXsUzTGY02oIiuideQ&q=${businessName}+${zipCode}`)
  let mapURL = `  
  	<iframe
  		src="https://www.google.com/maps/embed/v1/place?key=AIzaSyClCuqyZIVyyddaalXsUzTGY02oIiuideQ
    		&q=${businessName}+${zipCode}"
    		allowfullscreen>
		</iframe>`
  
  $('.business-map').html(mapURL);
  /*const mapOptions = {
  	center: new google.maps.LatLng(coords),
  	zoom: 5,
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(coords),
        animation: google.maps.Animation.DROP,
        map: map,
    });*/
}


function handleLightbox(data){
  console.log("handle lightbox ran");
  displayLightbox();
  const dataObject = {
    results: {
      locations:{
        name: "Wright & Weiner",
        address: {
          street: "801 S Rancho Dr # B2",
          city: "Las Vegas",
          state: "NV",
          postal_code: "89106"
        },
        phone_number: "7022596789",
        latitude: 36.226363,
        longitude: -115.261751,
        image: "http://images.citysearch.net/assets/imgdb/merchant/2010/7/7/0/qfgWIpyC84.jpeg",
        website: "https://weinerlawnevada.com/"
      }
  }};
  let businessData = displayPlaces(dataObject);
  let mapData = displayMap(dataObject);
  $('.business-data').html(businessData);
}

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