/**
*Submitted for verification at base.blockscout.com on 2025-09-15
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
* @title Block Ninja Leaderboard
* @dev Smart contract to store and manage Block Ninja game scores on Base Mainnet
*/
contract Leaderboard {
   struct ScoreEntry {
       address player;
       uint256 score;
       uint256 timestamp;
   }
   
   ScoreEntry[] public scores;
   mapping(address => uint256) public playerBestScore;
   mapping(address => uint256) public playerTotalGames;
   
   event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
   event NewHighScore(address indexed player, uint256 score);
   
   function submitScore(uint256 score) external {
       require(score > 0, "Score must be greater than 0");
       address player = msg.sender;
       uint256 timestamp = block.timestamp;
       scores.push(ScoreEntry({ player: player, score: score, timestamp: timestamp }));
       playerTotalGames[player]++;
       if (score > playerBestScore[player]) {
           playerBestScore[player] = score;
           emit NewHighScore(player, score);
       }
       emit ScoreSubmitted(player, score, timestamp);
   }
   
   function getTopScores(uint256 limit) external view returns (ScoreEntry[] memory) {
       require(limit > 0, "Limit must be greater than 0");
       uint256 length = scores.length;
       if (length == 0) return new ScoreEntry[](0);
       ScoreEntry[] memory sortedScores = new ScoreEntry[](length);
       for (uint256 i = 0; i < length; i++) { sortedScores[i] = scores[i]; }
       for (uint256 i = 0; i < length - 1; i++) {
           for (uint256 j = 0; j < length - i - 1; j++) {
               if (sortedScores[j].score < sortedScores[j + 1].score) {
                   ScoreEntry memory temp = sortedScores[j];
                   sortedScores[j] = sortedScores[j + 1];
                   sortedScores[j + 1] = temp;
               }
           }
       }
       uint256 returnLength = length > limit ? limit : length;
       ScoreEntry[] memory topScores = new ScoreEntry[](returnLength);
       for (uint256 i = 0; i < returnLength; i++) { topScores[i] = sortedScores[i]; }
       return topScores;
   }
   
   function getPlayerBestScore(address player) external view returns (uint256) { return playerBestScore[player]; }
   function getPlayerTotalGames(address player) external view returns (uint256) { return playerTotalGames[player]; }
   function getTotalScores() external view returns (uint256) { return scores.length; }
   function getPlayerScores(address player) external view returns (ScoreEntry[] memory) {
       uint256 count = 0;
       for (uint256 i = 0; i < scores.length; i++) { if (scores[i].player == player) { count++; } }
       if (count == 0) return new ScoreEntry[](0);
       ScoreEntry[] memory playerScores = new ScoreEntry[](count);
       uint256 index = 0;
       for (uint256 i = 0; i < scores.length; i++) { if (scores[i].player == player) { playerScores[index] = scores[i]; index++; } }
       return playerScores;
   }
   function getGlobalHighScore() external view returns (uint256) {
       if (scores.length == 0) return 0;
       uint256 highScore = 0;
       for (uint256 i = 0; i < scores.length; i++) { if (scores[i].score > highScore) { highScore = scores[i].score; } }
       return highScore;
   }
}
