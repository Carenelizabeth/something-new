#Something New

## View it Live

**Live demo**
https://carenelizabeth.github.io/something-new/

**Non-restricted version**
http://somethingnew.carenkeyes.com/

## Summary
Users are prompted to enter a location and the type of service that they require.
An ajax required to Citygrid's reviews endpoint is made and the results are displayed, with the name of the business, the review itself and the author of the review. On hover (or tab or touch), two links appear: one is the Google map icon and the other is the icon for the original review site.
When the map icon is selected, a series of calls to Google Maps javascript API ensue. The first adds a map, centered about the latitude and longitude of the original request. Next, a search is performed on the name of the business and a marker is added for each results. Finally, an infobox for each results is populated with the name and address of the business. This appears when a marker is clicked.
When the review icon is selected, the lightbox opens with an iframe containing the original review source. Because some website don't allow display in an iframe, I used a little hack to display an error message. The url is encoded into a link at the bottom of the page. A loading message is displayed in the top part, which is located behind a transparent iframe. The loading message changes to an error message after 3 seconds, enouraging users to use the url provided to visit the site in a new tab. If the site does load, it covers the error message. Either way, users have the option of visiting the site in a new tab.

## Screenshots
Landing page:
![Landing page](http://carenkeyes.com/wp-content/uploads/2018/04/Landing_page.png)

Search results (additional information appaears on hover, touch or when link is activated by keyboard):
![Search results](http://carenkeyes.com/wp-content/uploads/2018/04/Results.png)

Results of Google places search of the business name. Infobox displayed on click:
![Maps open in lightbox](http://carenkeyes.com/wp-content/uploads/2018/04/Map.png)

Website for the original review opens in lightbox. Note that Github won't allow unsecured pages to be displayed
![Review website open in Lightbox](http://carenkeyes.com/wp-content/uploads/2018/04/Review.png) 

## Learning Opportunities