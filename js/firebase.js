const firebaseConfig = {
    apiKey: "AIzaSyA5JQWLWzWhwz2_btagzYGrtgIUeuCTxv8",
    authDomain: "world-cup-competition.firebaseapp.com",
    databaseURL: "https://world-cup-competition-default-rtdb.firebaseio.com",
    projectId: "world-cup-competition",
    storageBucket: "world-cup-competition.appspot.com",
    messagingSenderId: "48661212629",
    appId: "1:48661212629:web:4eed234bd4eaaae5cf215c"
  };
//initialize Firebase
firebase.initializeApp(firebaseConfig);

//reference database
var wccDB = firebase.database().ref('World Cup Competition')
var playersRef = firebase.database().ref('Users')

// function isValid(){
//     var isValid = false;
//     playersRef.once("value", function(snapshot){
//         var users = snapshot.val();
//         for(let i in users){
//             if(users[i].username == username && users[i].password == password){
//                 isValid = true;
//             }
//         }
//     })
//     console.log(isValid);
//     return isValid;
// }

var path = window.location.pathname;
var file = path.split("/").pop();
//console.log(file);
switch (file) {
    case 'index.html':
        //authenticade player
        document.getElementById('login').addEventListener('submit', function(e){
            e.preventDefault(); //stop form from submitting

            var username = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            playersRef.once("value", function(snapshot){
                var users = snapshot.val();
                var isValidUser = true;
                for(let i in users){
                    if(users[i].username == username && users[i].password == password){
                        localStorage.setItem("username", username);
                        localStorage.setItem("password", password);
                        window.location.href="index.html";
                        document.getElementById('login').submit();
                        isValidUser = false
                    }
                }
                if (isValidUser){
                    alert("Algo correu mal, tenta outra vez !");
                }
            })
            
            //console.log(test());
           

            // var username = document.getElementById('username').value;
            // var password = document.getElementById('password').value;
            // playersRef.once("value", function(snapshot){
            //     var users = snapshot.val();
            //     for(let i in users){
            //         if(users[i].username == username && users[i].password == password){
                        
            //         }
            //         console.log(users[i].password);
            //     }
            // })
        });
      break;
    case 'admin.html':
        //add new participant to competition
        document.getElementById('participantForm').addEventListener('submit', function(e){
            e.preventDefault(); //stop form from submitting

            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;
            var bets = [""]

            console.log(username, password);
            var score = playersRef.push();
            score.set({
                username : username,
                password : password,
                bets : bets
            })
        });

         //add new game to competition
         document.getElementById('gameForm').addEventListener('submit', function(e){
            e.preventDefault(); //stop form from submitting

            var home = document.getElementById('home').value;
            var away = document.getElementById('away').value;
            var info = document.getElementById('info').value;
            var phase = document.getElementById('phase').value;

            console.log(username, password);
            var ref = firebase.database().ref('World Cup Competition/'.concat(phase))
            var game = wccDB.push();
            game.set({
                home : home,
                away : away,
                info : info,
                score : ""
            })
        });
      break;
    case 'home.html':
        //add all the games in the DB
        wccDB.once("value", function(snapshot){
            var users = snapshot.val();
            var isValidUser = true;
            for(let i in users){
               console.log(i)
            }
        })


        //add participant name to welcome page
        console.log(localStorage.getItem("username"));
        document.getElementById("AQUI").innerHTML = localStorage.getItem("username");

        //add prediction to database
        document.getElementById('betForm').addEventListener('submit', function(e){
            e.preventDefault(); //stop form from submitting

            var team1;
            var team2;
            var team1result = document.getElementById('team1').value;
            var team2result = document.getElementById('team2').value;

            var game = team1.concat("-", team2);
            var result = team1result.concat("-", team2result);

            var bets = localStorage.getItem("bets")
            console.log(bets);
            updateBets(bets, game, result);
            console.log(bets);


            // console.log(team1result, team2result);
            // var score = wccDB.push();
            // score.set({
            //     game: team1.concat("-", team2),
            //     result : team1result.concat("-", team2result)
            // })
        });
      break;
    default:
      //TODO
  }



function updateBets(bets, game, result){
    bets[0] === "" ? bets[0] = [game, result] : bets.push([game, result]); 
}