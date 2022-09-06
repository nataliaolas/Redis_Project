var express = require('express');
var app = express();
//var redis = require("redis"),
var redis = require('promise-redis')();

//polaczenie z baza redis
client = redis.createClient("redis://localhost:6379/0");
client.on("error", function (err) {
    console.log("Error " + err);
});

//navbar
app.use(function (req, res, next) {
    var menu = `
    <a href="/kategorie_obcojezyczne">Kategorie książek obcojęzycznych </a> |
    <a href="/dodaj-ksiazke">Dodaj książke do zbioru </a> |
    <a href="/rowling">Najpopularniejszy autor - informacje </a> |
    <a href="/ksiazka_kucharska">Lista książek kucharskich </a> |
    <a href="/zbiorksiazek">Usuwanie książek </a>
    <hr>`;
    req.m = menu;
    next();
});

//opis aplikacji:
app.get('/', function (req, res) {
    res.send(req.m +
        ` <br> Aplikacja umożliwia:
    <ul>
    <li> Sprawdzenie zbioru kategorii książek obcojęzycznych </li>
    <li> Formularz dodania ksiazki do zbioru książek </li>
    <li> Informacje o najpopularniejszym autorze(tablicy asocjacyjnej) oraz na osobnym url o jego najbardziej poczytalnej książce </li> 
    <li>Lista książek kucharskich za pomocą batch</li>
    <li> Usuwanie książek ze zbioru </li>
    </ul>`);
});

//informacja o danym autorze 
app.get('/rowling', function (req, res) {
    client.hgetall("autor", function (err, data) {
        var hash = "<ul>";
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                hash += "<li>" + key + "-->" + data[key] + "</li>";
            }
        }
        hash += "</ul>";
        console.log(data);
        res.send(req.m + "Informacje o najpopularniejszej autorce na stronie " + hash);
    });
});

//informacja o najpopularniejszej ksiazce autor
app.get('/rowling/:ksiazka', function (req, res) {
    client.hget("autor", req.params.ksiazka, function (err, data) {
        console.log(data);
        res.send(req.m + "Najpopularniejsza książka: " + data);
    });
});

//zbiór posortowany - kategorie obcojezyczne 
app.get('/kategorie_obcojezyczne', function (req, res) {
    client.zrange("kategorie_ksiazek_obcojezycznych", 0, -1, function (err, data) {
        var kategorie = "<ul>";
        for (var i = 0; i < data.length; i++) {
            kategorie += "<li>" + data[i] + "</li>";
        }
        kategorie += "</ul>";
        console.log(data);
        res.send(req.m + "Kategorie książek obcojęzycznych: " + kategorie);
    });
});

//Spis informacji o książce kucharskiej za pomocą metody batch
app.get('/ksiazka_kucharska', function (req, res) {
    client.keys("ksiazka_kucharska:*", function (err, kluczeOsob) {
        const batch = client.batch();
        for (k of kluczeOsob) {
            batch.hgetall(k);
        }
        batch.exec(function (err, osoby) {
            var lista = "<ul>";
            for (os of osoby) {
                lista += `<li>${os.tytul} ${os.autor}, ${os.wydawnictwo}, ${os.rokwydania},${os.typ_oprawy}</li>`;
            }
            lista += "</ul>"
            res.send(req.m + "Lista książek kucharskich: " + lista);
        });
    });
});

//dodanie ksiazki formularz 
app.get('/dodaj-ksiazke', function (req, res) {
    var form = `
                    <form action="/dodajksiazke" method="GET">
                    Tytul: <input type="text" name="tytul">
                    <input type="submit" value="Dodaj">
                    </form>
                    `;
    res.end(form);
});

//dodanie ksiazki 
app.get('/dodajksiazke', function (req, res) {
    client.sadd("zbior_ksiazek", req.query.tytul, function (err, data) {
        if (err) {
            console.log(err);
            res.end("Blad dodania obiektu do bazy");
        }
        if (data == 1) {
            res.end(`Ksiazka zostala dodana do bazy.`);
        } else if (data == 0) {
            res.end(`Ksiazka NIE została dodana do bazy.`);
        }
    });
});

//usuwanie ksiazki ze zbioru
app.get('/zbiorksiazek', function (req, res) {
    client.smembers("zbior_ksiazek", function (err, data) {
        var zbior = "<ul>";
        for (var i = 0; i < data.length; i++) {
            var url = encodeURIComponent(data[i]);
            zbior += `<li> ${data[i]}  <a href="usunksiazke?tytul=${url}">Usuń</a></li>`;
        }
        zbior += '</ul>';
        console.log(data);
        res.send(req.m + "Odczytany zbior: " + zbior);
    });
});

//usuwanie ksiazki i efekty usunięcia
app.get('/usunksiazke', function (req, res) {
    client.srem("zbior_ksiazek", req.query.tytul, function (err, data) {
        console.log(req.query.tytul);
        res.end(req.m + "Liczba usunietych elementow: " + data);
    });
});

//rozłaczenie z baza 
app.get('/disconnect', function (req, res) {
    client.quit();
    // client.end(true);
    res.send("Nastąpiło rozłączenie z bazą danych");
});

app.listen(5000);