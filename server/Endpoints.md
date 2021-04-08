**Get Scores** 

type: GET 

URL: /API/scores 

parameters:
 - page: int, default = 0, page of data to be requested
 - limit: int, default = 25, number of items per page
 - level: int, default = -1 (all levels), filter results by level id
 - weather: string, default = "", filters weather strictly based string provided
 - hasweather: string, default = "", filters weather based string provided
 
  
 example: /API/score?page=0&limit=5 
 
 result: [{"id":1,"nick":"test","time":1,"weather":"snow","collected":"0","level":0},{"id":2,"nick":"test","time":1,"weather":"snow","collected":"0","level":0},{"id":3,"nick":"bill","time":1,"weather":"[]","collected":"1","level":0}]
 
 **Get Score By ID** 

type: GET 

URL: /API/score

parameters:
 - id: int, id of the score being requested 

  
 example: /API/score?id=1
 
 result: {"id":1,"nick":"test","time":1,"weather":"snow","collected":"0","level":0}
 
   **Post Score** 

type: POST 

URL: /API/score 

parameters:
 - name: string, nickname of score submission
 - time: int, time remining when level was completed
 - weather: string, default: '[]', JSON array of occuring weather conditions
 - coins: int, default: 0, number of coins collected per level
 - level: int, id of level for score submission

  
 example: /API/score?name=bob&time=10&weather=['ice']&coins=25&level=2
 
 result: 200 for successful post