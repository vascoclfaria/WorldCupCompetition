const firebaseConfig = {
    apiKey: "AIzaSyA5JQWLWzWhwz2_btagzYGrtgIUeuCTxv8",
    authDomain: "world-cup-competition.firebaseapp.com",
    databaseURL: "https://world-cup-competition-default-rtdb.firebaseio.com",
    projectId: "world-cup-competition",
    storageBucket: "world-cup-competition.appspot.com",
    messagingSenderId: "48661212629",
    appId: "1:48661212629:web:4eed234bd4eaaae5cf215c"
};

//initialize variables  
const firebaseApp = firebase.initializeApp(firebaseConfig); //initialize Firebase  
const auth = firebase.auth(firebaseApp);
const db = firebase.database();
const gamesDB = db.ref('World Cup Competition');

let _player;
let matchesArray = []
let path = window.location.pathname;
let file = path.split("/").pop();
console.log(file);


switch (file) {
    case 'index.html':
        //login player
        document.getElementById('test').addEventListener('click', function (e) {
            e.preventDefault(); //stop form from submitting
            loginUser();
        });

        firebase.auth().createUserWithEmailAndPassword("vasco.faria@hotmail.com", "1234")
        break;
    case "register.html":
        //register new user in DB
        document.getElementById('registerForm').addEventListener('submit', function (e) {
            e.preventDefault(); //stop form from submitting
            registerUser();
        });
        break;
    case 'home.html':
        //add participant name to welcome page
        document.getElementById("_player").innerHTML = localStorage.getItem("username"); //TO DELETE
        _player = localStorage.getItem("username");

        //add all the games in the DB to welcome page
        //TODO - order games by date
        gamesDB.once("value", function (snapshot) {
            var phases = snapshot.val();
            for (let p in phases) {
                newSection(p);
                gamesDB.child(p).once("value", function (snapshot) {
                    var games = snapshot.val();
                    for (let g in games) {
                        gamesDB.child(p).child(g).once("value", function (snapshot) {
                            var game = snapshot.val();
                            var posName = "games_" + p.charAt(0);
                            var gameID = p.charAt(0) + "_game" + Object.keys(games).indexOf(g);
                            var playerBet = getPlayerBet(game.bets, _player);
                            // console.log(gameID, ": ", playerBet)
                            
                            // setDate(game);
                            // matchesArray.sort(function (a, b) {
                            //     return a - b
                            // });

                            //console.log(gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr);
                            newMatch(posName, gameID, game.home, game.away, game.info, game.score, playerBet, games);
                        })
                    }
                    console.log(matchesArray);
                });
            }
        });

        //add prediction to database
        document.getElementById('betForm').addEventListener('submit', function (e) {
            e.preventDefault(); //stop form from submitting

            //db.ref('World Cup Competition/Fase de Grupos/-NEvZQxzPHZm-PApC-Vp');

            var home_team = document.getElementById('home_team_popup').innerHTML;
            var away_team = document.getElementById('away_team_popup').innerHTML;
            var home_score = document.getElementById('home_score_popup').value;
            var away_score = document.getElementById('away_score_popup').value;
            var bet = { key: _player, value: home_score + "-" + away_score };

            gamesDB.once("value", function (snapshot) {
                var phases = snapshot.val();
                for (let p in phases) {
                    gamesDB.child(p).once("value", function (snapshot) {
                        var games = snapshot.val();
                        for (let g in games) {
                            gamesDB.child(p).child(g).once("value", function (snapshot) {
                                var game = snapshot.val();
                                var home = game.home;
                                var away = game.away;
                                var info = game.info;
                                var bets = game.bets;

                                console.log("bets: ", bets);
                                console.log(home, home_team, " || ", away, away_team);

                                if (home == home_team && away == away_team) {
                                    if (!canBet(new Date(info))) {
                                        alert("O tempo para apostar/alterar aposta terminou");
                                    }
                                    else if (bet.value == "-") {
                                        alert("Aposta inválida");
                                    }
                                    else {
                                        //Update bet in DB World Cup Competition
                                        bets[bet.key] = bet.value;
                                        gamesDB.child(p).child(g).update({
                                            bets: bets
                                        });

                                        //Update bet in DB Users
                                        db.ref('Users/' + _player).once("value", function (snapshot) {
                                            var user = snapshot.val();
                                            var bets = user.bets;

                                            bets[g] = bet.value;
                                            db.ref('Users/' + _player).update({
                                                bets: bets
                                            });
                                        });


                                        alert("Aposta colocada");
                                        window.location.href = file;
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
        break;
    case 'admin.html':
        //create datalist of games in DB
        gamesDB.once("value", function (snapshot) {
            var phases = snapshot.val();
            for (let p in phases) {
                gamesDB.child(p).once("value", function (snapshot) {
                    var games = snapshot.val();
                    for (let g in games) {
                        gamesDB.child(p).child(g).once("value", function (snapshot) {
                            var game = snapshot.val();

                            let list = document.getElementById("games");
                            let option = document.createElement('option');
                            option.value = game.home + " - " + game.away + " (" + game.info.split("T")[0] + ")";
                            option.id = p.replace(/\s/g, "-") + " " + g;
                            list.appendChild(option);
                        });
                    }
                });
            }
        });

        //add new game to competition
        document.getElementById('gameForm').addEventListener('submit', function (e) {
            e.preventDefault(); //stop form from submitting

            var phase = document.getElementById('phase').value;
            var home = document.getElementById('home').value;
            var away = document.getElementById('away').value;
            var info = document.getElementById('info').value;
            var bets = { "Nome do apostador": "Aposta" }

            var ref = firebase.database().ref('World Cup Competition/' + phase)
            var game = ref.push();
            game.set({
                home: home,
                away: away,
                info: info,
                bets: bets,
                score: ""
            })

            alert("Jogo colocado na base de dados");

            document.getElementById('phase').value = "";
            document.getElementById('home').value = "";
            document.getElementById('away').value = "";
            document.getElementById('info').value = "";
        });

        //add score to a game
        document.getElementById('scoreForm').addEventListener('submit', function (e) {
            e.preventDefault(); //stop form from submitting

            var input = document.getElementById('game');
            var datalist = document.getElementById('games');
            var id = datalist.querySelector(`[value="${input.value}"]`).id;
            var phase = id.split(" ")[0].replace(/-/g, ' ');
            var game = id.split(" ")[1];
            var score = document.getElementById('score').value;
            //console.log("GAME: ", phase, game, score)

            gamesDB.child(phase).child(game).update({
                score: score
            });


            var usersDB = db.ref("Users");
            usersDB.once("value", function (snapshot) {
                var users = snapshot.val();
                // console.log("Bets: ", users);
                for (let u in users) {
                    usersDB.child(u).once("value", function (snapshot) {
                        var user = snapshot.val();
                        // console.log("Bets: ", user);
                        var bets = user.bets;
                        var points = parseInt(user.points);

                        for (b in bets) {
                            if (b != "GameRef") {
                                var bet = bets[b];
                                // console.log("Bets: ", bet);

                                var x = bet.split("-")[0];
                                var y = bet.split("-")[1];
                                var sx = score.split("-")[0];
                                var sy = score.split("-")[1];

                                console.log("   bet: ", x + " " + y);
                                console.log("   sco: ", sx + " " + sy);


                                if (x == sx && y == sy) {
                                    points += 5;
                                }
                                else if (Math.abs(x - y) == Math.abs(sx - sy)) {
                                    points += 3
                                }
                                //TODO
                                else if ("TODO" == "") {
                                    points += 1;
                                }

                                console.log("   Points: ", points);
                                usersDB.child(u).update({
                                    points: points
                                });
                            }
                        }

                    });
                }
            });


            alert("Jogo colocado na base de dados");

            document.getElementById('game').value = "";
            document.getElementById('score').value = "";
        });
        break;
    case 'classification.html':
        //TODO - Get elements ordered by nº of points
        var usersDB = db.ref("Users");
        usersDB.once("value", function (snapshot) {
            var users = snapshot.val();
            console.log("users: ", users);
            var count = 1;
            for (let u in users) {
                usersDB.child(u).once("value", function (snapshot) {
                    var user = snapshot.val();
                    console.log("user: ", user);

                    let table = document.getElementById("table");

                    let row = document.createElement('div');
                    row.classList.add("row");

                    let pos = document.createElement('div');
                    pos.classList.add("cell");
                    pos.innerHTML = count + "º";

                    let name = document.createElement('div');
                    name.classList.add("cell");
                    name.title = "Name";
                    name.innerHTML = u;

                    let points = document.createElement('div');
                    points.classList.add("cell");
                    points.title = "Pontos";
                    points.innerHTML = user.points;

                    row.appendChild(pos);
                    row.appendChild(name);
                    row.appendChild(points);
                    table.appendChild(row);

                    count++;
                });
            }
        });
        break;
    default:
    //TODO
}




/**
 * This method creates a new section/table to place games. Each section defines a 
 * phase of the competition
 * @param {*} name 
 */
function newSection(name) {
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
    games.id = "games_" + name.charAt(0);

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

/**
 * This method creates a new entry on the table for the game
 * in question
 * 
 * @param {*} gameID 
 * @param {*} home_team 
 * @param {*} away_team 
 * @param {*} match_info 
 * @param {*} match_score 
 * @param {*} match_bet 
 * @param {*} matchesArr 
 */
function newMatch(posName, gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr) {
    let games = document.getElementById(posName)

    let init = document.createElement('div');
    init.id = gameID;
    init.classList.add("fixture");
    init.onclick = function (event) {
        document.getElementById("empty").classList.add('empty'); //change background opacity

        var home = document.getElementById(gameID).children[0].children[0].children[1].children[0].innerHTML;
        var homeImg = document.getElementById(gameID).children[0].children[0].children[0].children[0].src;
        var away = document.getElementById(gameID).children[0].children[2].children[1].children[0].innerHTML;
        var awayImg = document.getElementById(gameID).children[0].children[2].children[0].children[0].src;
        var info = document.getElementById(gameID).children[0].children[1].children[0].innerHTML;
        console.log("Info: ", info);

        document.getElementById("home_team_popup").innerHTML = home;
        document.getElementById("home_img_popup").src = homeImg;
        document.getElementById("away_team_popup").innerHTML = away;
        document.getElementById("away_img_popup").src = awayImg;
        document.getElementById("info_popup").innerHTML = info;

        document.querySelector(".popup").style.display = "block"; //show game
    }

    let scoreboar = document.createElement('div');
    scoreboar.classList.add("score-board");

    //Home____________________________________________
    let home = document.createElement('div');
    home.classList.add("home");

    let imgDivHome = document.createElement('div');
    let imgHome = document.createElement('img');
    imgHome.classList.add("team-img");
    imgHome.src = "images/Countries/" + home_team + ".png";
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
    console.log("Mach info: ", match_info);
    info.innerHTML = dateToString(match_info);
    matchDiv.appendChild(info);
    let score = document.createElement('div');
    score.classList.add("score");
    console.log("match_score:", match_score)
    match_score != "" ? score.innerHTML = match_score : score.style.display = "none";
    score.innerHTML = match_score;
    matchDiv.appendChild(score);
    let betTitle = document.createElement('div');
    betTitle.classList.add("match-info");
    betTitle.innerHTML = "APOSTA";
    matchDiv.appendChild(betTitle);
    let bet = document.createElement('div');
    bet.style = "text-align: center;"
    console.log(match_bet);
    if (match_bet != "")
        bet.innerHTML = match_bet;
    else {
        bet.style.display = "none";
        betTitle.style.display = "none";
    }
    // match_bet != "" ? bet.innerHTML = match_bet : bet.style.display = "none", betTitle.style.display = "none";
    bet.innerHTML = match_bet;
    matchDiv.appendChild(bet);

    //Away____________________________________________
    let away = document.createElement('div');
    away.classList.add("away");

    let imgDivAway = document.createElement('div');
    let imgAway = document.createElement('img');
    imgAway.classList.add("team-img");
    imgAway.src = "images/Countries/" + away_team + ".png";
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
    let gameNumber = parseInt(gameID.replace(/^\D+/g, ''));
    let gamesLength = Object.keys(matchesArr).length;
    if (gameNumber < gamesLength - 1) {
        let separator = document.createElement('hr');
        games.appendChild(separator);
    }
}


function setDate(game) {
    let monthsAbr = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dez"];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var month = game.info.split(" ")[0];
    var day = game.info.split(" ")[1];
    let hour = game.info.split(" ")[3];
    let date = new Date(months[monthsAbr.indexOf(month)] + " " + day + ", 2022 " + hour);

    matchesArray.push(date)
    console.log(matchesArray);
}

/**
 * This method creates, acording to the date of the game,
 * a date string to be displayed to the user
 * 
 * @param {*} sMachInfo 
 */
function dateToString(sMachInfo) {
    let monthsAbr = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dez"];
    let weekDaysAbr = ["Dom", "Seg", "Terç", "Qua", "Qui", "Sex", "Sáb"];
    let dateVar = new Date(sMachInfo);

    let date = sMachInfo.split("T")[0];
    let weekDay = weekDaysAbr[dateVar.getDay()];
    let day = date.split("-")[2];
    let month = monthsAbr[date.split("-")[1] - 1];
    let time = sMachInfo.split("T")[1];

    return month + " " + day + " (" + weekDay + ") " + time;
}

/**
 * This method checks whether a player can bet / change bets 
 * or not
 * 
 * @param {*} gameDate 
 */
function canBet(gameDate) {
    let todaysDate = new Date();
    let diffInMs = (gameDate - todaysDate) / (1000 * 60);

    return diffInMs > 0 ? true : false;
}


/**
 * This method return the players bet in case he made one
 * or not
 * 
 * @param {*} arrBets    //all bets of the game
 * @param {*} playerName 
 */
function getPlayerBet(arrBets, playerName) {
    for (key in arrBets) {
        if (key == playerName)
            return arrBets[key];
    }
    return ""
}

/**
 * This method registers new user in the firebase DataBase 
 * 
 */
function registerUser() {
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(function () {
            let user = auth.currentUser;

            db.ref('Users/' + username).set({
                email: email,
                points: 0,
                bets: { "GameRef": "bet" }
            })

            window.location.href = "index.html";
        })
        .catch(function (error) {
            let error_code = error.code;
            let error_msg = error.message;
            alert(error_msg);
        });
}

/**
 * This method is responsible for the login of user 
 * 
 */
function loginUser() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
            let player = auth.currentUser;
            let playerEmail = player.email;

            db.ref('Users').once("value", function (snapshot) {
                var users = snapshot.val();
                for (let u in users) {
                    db.ref('Users').child(u).once("value", function (snapshot) {
                        var user = snapshot.val();

                        console.log("   ", user.email, playerEmail)
                        if (user.email == playerEmail) {
                            localStorage.setItem("username", u);
                            window.location.href = "home.html";
                        }
                    });
                }
            });
        })
        .catch(function (error) {
            let error_code = error.code;
            let error_msg = error.message;
            alert(error_msg);
        })
}


