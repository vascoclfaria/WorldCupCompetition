//import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA5JQWLWzWhwz2_btagzYGrtgIUeuCTxv8",
    authDomain: "world-cup-competition.firebaseapp.com",
    databaseURL: "https://world-cup-competition-default-rtdb.firebaseio.com",
    projectId: "world-cup-competition",
    storageBucket: "world-cup-competition.appspot.com",
    messagingSenderId: "48661212629",
    appId: "1:48661212629:web:4eed234bd4eaaae5cf215c"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig); //initialize Firebase

//initialize auth       
 const auth = firebase.auth(firebaseApp);
 const db = firebase.database();
 

//reference database
var dbRef = db.ref('World Cup Competition')

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

let matchesArray = []
var path = window.location.pathname;
var file = path.split("/").pop();
console.log(file);
switch (file) {
    case 'index.html':
        //register player
        document.getElementById('test').addEventListener('click', function(e){
            console.log("teste");
            e.preventDefault(); //stop form from submitting

            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;

            auth.signInWithEmailAndPassword(email, password)
            .then(function(){
                let user = auth.currentUser;

                // db.ref('Users/' + user.uid).set({
                //     username : username,
                //     email : email,
                // })

                window.location.href = "home.html";
            })
            .catch(function(error){
                let error_code = error.code;
                let error_msg = error.message;
            })
        });
        
        firebase.auth().createUserWithEmailAndPassword("vasco.faria@hotmail.com", "1234")
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
            var game = dbRef.push();
            game.set({
                home : home,
                away : away,
                info : info,
                phase : phase,
                bets : ""
            })
        });
      break;
    case 'home.html':
        //add all the games in the DB
        newSection("Fase de Grupos");
        dbRef.once("value", function(snapshot){
            var matches = snapshot.val();
            var isValidUser = true;
            for(let i in matches){
                dbRef.child(i).once("value", function(snapshot){
                    var data = snapshot.val();
                    setDate(data);
                    console.log("Este:", matchesArray);
                    matchesArray.sort(function(a, b){
                        return a - b 
                   });
                    console.log("Aquele:", matchesArray);
                    let matchID = "game"+Object.keys(matches).indexOf(i);
                    
                    //console.log(matchId, home_team, away_team, match_info, match_score, match_bet, matchesArr);
                    newMatch(matchID, data.home, data.away, data.info, data.score, "2-1", matches);
                    //add click listener to game
                    document.getElementById(matchID).onclick = function(event) {
                        //console.log("OIIII: ", document.getElementById(matchID).children[0].children[0].children[1]);
                        document.getElementById("empty").classList.add('empty'); //change background opacity
                
                        let home = document.getElementById(matchID).children[0].children[0].children[1].innerHTML;
                        let homeImg = document.getElementById(matchID).children[0].children[0].children[0].children[0].src;
                        let away = document.getElementById(matchID).children[0].children[2].children[1].innerHTML;
                        let awayImg = document.getElementById(matchID).children[0].children[2].children[0].children[0].src;
                  
                        document.getElementById("home_team_popup").innerHTML = home;
                        document.getElementById("home_img_popup").src = homeImg;
                        document.getElementById("away_team_popup").innerHTML = away;
                        document.getElementById("away_img_popup").src = awayImg;
                                    
                        document.querySelector(".popup").style.display = "block"; //show game
                      }
                })
                //console.log(i)
            }
            console.log(matchesArray);
            // //sorting array not working
            // matchesArray = matchesArray.sort(function(date1, date2){
            //     return date1 - date2
            // });
            // console.log(matchesArray);

            // const date1 = new Date('16 March 2017');
            // const date2 = new Date('01/22/2021');
            // const date3 = new Date('2000-12-31');
            // const dates = [];
            // dates.push(date1);
            // dates.push(date2);
            // dates.push(date3);
            // console.log("Dates1:", dates);

            // dates.sort(function(a, b){
            //     return b - a 
            // });

            // console.log("Dates2:", dates);
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
            // var score = dbRef.push();
            // score.set({
            //     game: team1.concat("-", team2),
            //     result : team1result.concat("-", team2result)
            // })
        });
      break;
      case "register.html":
        //register new user in DB
        document.getElementById('registerForm').addEventListener('submit', function(e){
            e.preventDefault(); //stop form from submitting
            //TODO

            let username = document.getElementById('username').value;
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;


            auth.createUserWithEmailAndPassword(email, password)
            .then(function(){
                let user = auth.currentUser;

                db.ref('Users/' + user.uid).set({
                    username : username,
                    email : email,
                })

                window.location.href = "index.html";
            })
            .catch(function(error){
                let error_code = error.code;
                let error_msg = error.message;
            })
        });
        break;
    default:
      //TODO
  }



function updateBets(bets, game, result){
    bets[0] === "" ? bets[0] = [game, result] : bets.push([game, result]); 
}


// // home.html
function newSection(name){
    let tables = document.getElementById("tables");


    let section = document.createElement('section');
    section.classList.add("about_section");
    section.classList.add("layout_padding");
    section.classList.add("mt-4");

    let firstContainer = document.createElement('div');
    firstContainer.classList.add("about_container");

    let secoundContainer = document.createElement('div');
    secoundContainer.classList.add("container");

    let games = document.createElement('div');
    games.id = "games";

    let tournament = document.createElement('div');
    tournament.classList.add("fixture-index");
    tournament.classList.add("tournament");

    let span = document.createElement('span');
    span.innerHTML = name;

    tournament.appendChild(span);
    games.appendChild(tournament);
    secoundContainer.appendChild(games);
    firstContainer.appendChild(secoundContainer);
    section.appendChild(firstContainer);
    tables.appendChild(section);
}

function newMatch(matchId, home_team, away_team, match_info, match_score, match_bet, matchesArr){
    let games = document.getElementById("games")

    let init = document.createElement('div');
    init.id = matchId;
    init.classList.add("fixture");
    //TODO - onclick

    let scoreboar = document.createElement('div');
    scoreboar.classList.add("score-board");

    //Home____________________________________________
    let home = document.createElement('div');
    home.classList.add("home");

    let imgDivHome = document.createElement('div');
    let imgHome = document.createElement('img');
    imgHome.classList.add("team-img");
    imgHome.src = "images/Countries/"+home_team+".png";
    imgDivHome.appendChild(imgHome);
    let nameDivHome = document.createElement('div');
    let nameHome = document.createElement('span');
    nameHome.id = "home_team";
    nameHome.innerHTML = home_team;
    nameDivHome.appendChild(nameHome);

    home.appendChild(imgDivHome);
    home.appendChild(nameDivHome);


    //Match info____________________________________________
    let matchDiv = document.createElement('div');

    let info = document.createElement('div');
    info.classList.add("match-info")
    info.innerHTML = match_info
    matchDiv.appendChild(info);
    let score = document.createElement('div');
    score.classList.add("score");
    match_score != "" ? score.innerHTML = match_score : score.classList.add("d-none");
    score.innerHTML = match_score;
    matchDiv.appendChild(score);
    let betTitle = document.createElement('div');
    betTitle.classList.add("match-info");
    betTitle.innerHTML = "APOSTA";
    matchDiv.appendChild(betTitle);
    let bet = document.createElement('div');
    bet.style = "text-align: center;"
    console.log(match_bet);
    match_bet != "" ? bet.innerHTML = match_bet : bet.classList.add("d-none"), betTitle.classList.add("d-none");
    bet.innerHTML = match_bet;
    matchDiv.appendChild(bet);

    //Away____________________________________________
    let away = document.createElement('div');
    away.classList.add("away");

    let imgDivAway = document.createElement('div');
    let imgAway = document.createElement('img');
    imgAway.classList.add("team-img");
    imgAway.src = "images/Countries/"+away_team+".png";
    imgDivAway.appendChild(imgAway);
    let nameDivAway = document.createElement('div');
    let nameAway = document.createElement('span');
    nameAway.id = "away_team";
    nameAway.innerHTML = away_team;
    nameDivAway.appendChild(nameAway);

    away.appendChild(imgDivAway);
    away.appendChild(nameDivAway);


    scoreboar.appendChild(home);
    scoreboar.appendChild(matchDiv);
    scoreboar.appendChild(away);
    init.appendChild(scoreboar);
    games.appendChild(init);

    //Separator
    let gameNumber = parseInt(matchId.replace( /^\D+/g, ''));
    let gamesLength = Object.keys(matchesArr).length;
    if(gameNumber < gamesLength-1){
        let separator = document.createElement('hr');
        games.appendChild(separator);
    }
}

function setDate(data){
    let monthsAbr = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dez"];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var month = data.info.split(" ")[0];
    var day = data.info.split(" ")[1];
    let hour = data.info.split(" ")[3];
    let date = new Date(months[monthsAbr.indexOf(month)] + " " + day + ", 2022 " + hour);

    matchesArray.push(date)
    console.log(matchesArray);
}


function register(){

    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;


    auth.createUserWithEmailAndPassword(email, password)
    .then(function(){
        console.log("REGISTADO");
        let user = auth.currentUser;

        db.ref('Users/' + user.uid).set({
            username : username,
            email : email,
        })

        window.location.href = "home.html";
    })
    .catch(function(error){
        let error_code = error.code;
        let error_msg = error.message;
    })
}

