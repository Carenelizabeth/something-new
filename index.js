const REVIEWS_API_URL = "https://api.citygridmedia.com/content/reviews/v2/search/where"
const PLACES_API_URL = "https://api.citygridmedia.com/content/places/v2/search/where"
const PUBLISHER_CODE = "10000022998"

function handleSearchForm(){
	console.log("handle search form ran")
	$('.js-search-form').submit(event => {
		event.preventDefault();
		let location = $(event.currentTarget).find('.js-location').val();
		let businessType = $(event.currentTarget).find('.js-business-type').val();
		console.log(location);
		console.log(businessType);
		$(event.currentTarget).find('js-business-type').val("");
		retrieveReviewsAPI(location, businessType, displayReviews);
	});
}

function retrieveReviewsAPI(location, businessType, callback){
	console.log("retrieve reviews api ran");
	const settings = {
		url: REVIEWS_API_URL,
		data:{
			where: `${location}`,
			what: `${businessType}`,
			days: 180,
			rpp: 10,
			format: json, 
			//sort: reviewRating,
			publisher: PUBLISHER_CODE
		},
		type: 'GET',
		dataType: 'json',
		success: callback
	};
	$.ajax(settings);
}

function displayReviews(data){
	console.out("display reviews ran");
	const reviews = data.items.map((item, index) =>
		renderReviews(item));
	$('.js-reviews-results').html(reviews);
}

function renderReviews(reviews){
	console.out("render reviews ran")
	return`
		<div class="each-review">
			<p class="review-text">${results.reviews.review_text}<p>
			<a class="review-business-name" href="#">${results.reviews.business_name}</a>
			<a class="review-source" href="${results.reviews.review_url}">Original Review</a>
 		</div>`
}

handleSearchForm();