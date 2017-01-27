# Quake

Quake reports the magnitude and location of several recent earthquakes near a particular city.


# Features

This is an Amazon Echo skill using the Alexa Skills Kit (ASK) SDK, and can be easily deployed to AWS Lambda. The service does not report earthquakes with a magnitude less than 3.0, or earthquakes over 14 days.


## Example Calls Using the Echo
Here are some sample conversations that you can have with Alexa.

### Example 1
Alexa, start Earthquake Info.  
*Near what city do you want to search for earthquakes?*  
Yuma, Arizona  
*Two earthquakes near Yuma. A magnitude 3.1 near Somerton. A magnitude 3.7 near Nuevo Leon.*

### Example 2
Alexa, ask Earthquake Info about Grand Rapids.  
*One earthquake near Grand Rapids.  A magnitude 4.01 near Battle Creek.*

### Example 3
Alexa, ask Earthquake Info about San Francisco, California.  
*No earthquakes near San Francisco in the last 14 days.*

# Technologies Used

* [AWS Lambda](https://aws.amazon.com/lambda/). The source is deployed on AWS Lambda.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro). To convert a city into location coordinates.
  * NOTE: An API Key is required to use this service.
* [USGS Earthquake Catalog API](http://earthquake.usgs.gov/fdsnws/event/1/). To access earthquake data.
