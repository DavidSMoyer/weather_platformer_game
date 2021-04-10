const GlobalObject = {
  userNick: undefined,
  conditionData: undefined,
  levelData: JSON.parse(`{
    "id": 1,
    "time": 10000,
    "objects": [
      {
        "type": "Player",
        "params": [205, 360]
      },
      {
        "type": "Flag",
        "params": [395, 370]
      },
      {
        "type": "Platform",
        "params": [300, 380, 200, 10]
      },
      {
        "type": "Coin",
        "params": [300, 350]
      }
    ]
  }`),
  activeEngine: null
}