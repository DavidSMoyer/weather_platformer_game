**Get Scores** 

type: GET 

URL: /API/scores 

parameters:
 - page: int, default = 0, page of data to be requested
 - limit: int, default = 25, number of items per page
 - level: int, default = -1 (all levels), filter results by level id
 
  
 example: /API/score?page=0&limit=5 
 
 result: not set
 
 **Get Score By ID** 

type: GET 

URL: /API/score

parameters:
 - id: int, id of the score being requested 

  
 example: /API/score?id=1
 
 result: not set 
 
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
 
 result: not set