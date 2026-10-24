FOTOANALYSE BEIM IMPORT
Beim Upload kann „Foto / Handschrift mit KI analysieren“ aktiviert werden. Nur mit diesem Häkchen werden die vorbereiteten Bilder/PDF-Seiten direkt und einzeln an Groq gesendet. Ohne Häkchen bleibt lokale OCR/der vorhandene PDF-Text aktiv. Erfolgreich analysierte Seiten werden bei Rate-Limit-Wiederholungen wiederverwendet. Unleserliche Zahlen dürfen nicht erraten werden. Ergebnisse bleiben ungeprüft. 33 automatisierte Tests bestanden; reale Handschrifterkennung über das Groq-Konto noch nicht geprüft.

OCR-UPDATE – 24.10.2026
- Fotos und gescannte PDF-Seiten werden lokal mit Tesseract.js 6.0.1 erkannt. Vorhandener PDF-Text wird im automatischen Layout-Modus direkt übernommen; Layoutwahl eine/zwei Spalten erzwingt OCR.
- OCR-Sprache wählbar: Deutsch/Englisch, Rumänisch/Englisch, Italienisch/Englisch. Bei zwei Spalten wird die Seite mittig geteilt, links vor rechts. Dies ist keine automatische Layoutgarantie; bei spaltenübergreifenden Überschriften ggf. Automatisch wählen.
- OCR-Engine und Sprachdateien werden bei Bedarf über öffentliche CDNs geladen und im Browser verarbeitet. Internet für den Erstdownload erforderlich. Bilddaten werden dabei nicht an den CDN-Anbieter hochgeladen.
- Der Standardimport und die normale Korrektur senden ausschließlich Text an Groq. Die Rezeptfelder sollen vollständig ins Deutsche übertragen werden. Originaltext bleibt in der Quellsprache.
- Originale und erkannter Text bleiben am Rezept erhalten. Scheitert OCR bei einer Seite, wird ein ungeprüfter Entwurf mit Hinweis statt eines vermeintlich vollständigen Teilrezepts angelegt.
- Im Bearbeiten: Originaldatei erneut mit KI auslesen. Nur diese ausdrückliche Aktion überträgt die hinterlegten Bilder/PDF-Seiten an Groq, einzeln und mit Wartepausen bei Limits. Danach werden deutsche Änderungsvorschläge verglichen; die Übernahme bleibt manuell.
- Hintergrundimport funktioniert in der geöffneten App; Tab offen lassen. Ergebnisse sind ungeprüft. Bildqualität, Mengen, Einheiten und Vollständigkeit am Original kontrollieren.
- 31 Tests bestanden. Echter Tesseract-Browsertest mit einem gedruckten Testbild erfolgreich; kein Live-Groq-Test und kein Android-Leistungstest für diese Änderung.

Die folgende Anleitung dokumentiert die ursprüngliche Version 0.7. Wo sie vom OCR-Update abweicht, gilt der Ablauf oben.

RezeptArchiv 0.7 – Groq-Anbindung vorbereitet
Stand: 22.10.2026

WAS DIE VERSION ENTHÄLT
- Rezept bearbeiten → KI-Assistent: Aufgaben auswählen → Rezept mit Groq korrigieren & vergleichen. Die App sendet automatisch den Originaltext und vorhandene vorbereitete Rezeptbilder; die Antwort erscheint direkt im bisherigen Vergleich. Vorschläge sind vorausgewählt. Änderungen abwählen oder übernehmen; Änderungen speichern schließt die Bearbeitung wie bisher.
- Mengen-/Einheitenänderungen benötigen weiterhin eine ausdrückliche Bestätigung. Antworten mit falschen Anfrage-IDs, unpassenden Feldwerten oder nicht belegbaren Originalzitaten werden verworfen.
- Import → Foto / Scan / Datei mit Groq erfassen: JPEG, PNG, WebP, PDF oder DOCX. Bilder/PDF-Seiten vor dem Senden prüfen und sortieren. Kameraauswahl ist auf unterstützten Smartphones möglich.
- Das Ergebnis wird in Titel, Kategorie, Portionen, Zutatengruppen und Zubereitungsgruppen gegliedert. Originaldateien und ausgelesener Text bleiben am Rezept.
- Bild-/Scan-Ergebnisse werden vor dem Speichern als Entwurf mit Prüfhinweis angezeigt. Unauffällige Textimporte ohne Hinweise werden sofort ungeprüft gespeichert. Kein KI-Ergebnis wird automatisch als geprüft markiert.
- Löschen, Hauptvarianten, PDF-Export, Kategorien und die manuelle Chat-Übergabe bleiben enthalten.

WICHTIGER STATUS
Die Anwendung und die geschützte Serveranbindung sind implementiert. Es wurde KEIN echter Groq-Aufruf mit einem API-Schlüssel durchgeführt. Die API-Tests nutzen simulierte Groq-Antworten. Eine verbindliche Aussage zur realen Erkennungsqualität ist erst nach Tests mit dem eigenen Groq-Konto möglich. Die Netzkonfiguration von Netlify ist vorbereitet, aber noch nicht auf Netlify bereitgestellt und dort getestet.
Die reine HTML-Datei oder die bisherige Chat-Vorschau kann die Serverfunktionen nicht ersetzen.

LOKAL AUF WINDOWS STARTEN
1. ZIP vollständig entpacken.
2. Node.js ab Version 22 installieren, falls noch nicht vorhanden.
3. Die Datei .env.example kopieren und die Kopie .env nennen. Im Windows-Explorer Dateinamenerweiterungen einblenden: Die Datei darf nicht .env.txt heißen.
4. .env in einem Texteditor öffnen. Den eigenen Groq-API-Schlüssel bei GROQ_API_KEY eintragen. Bei APP_ACCESS_CODE einen selbst gewählten Zugangscode mit mindestens 16 Zeichen setzen. Der Zugangscode ist NICHT der Groq-Schlüssel.
5. START_WINDOWS.cmd doppelt anklicken; alternativ im entpackten Ordner im Terminal npm start ausführen. Keine zusätzlichen npm-Pakete notwendig.
6. http://localhost:8080 im Browser öffnen. Fenster mit dem Server offen lassen.
7. In der App Mehr → Groq einrichten öffnen, den App-Zugangscode eingeben und Verbindung freischalten.
8. Zum ersten Test Aperol Spritz Pie öffnen → Rezept bearbeiten → Ins Deutsche übersetzen anhaken → Rezept mit Groq korrigieren & vergleichen.
9. Zum Bildtest ein gut lesbares Rezeptfoto oder ein PDF mit höchstens drei Seiten verwenden. Die Ergebnisse immer am Original kontrollieren.

MODELLE
Die Modelle werden ausschließlich serverseitig über GROQ_TEXT_MODEL und GROQ_VISION_MODEL festgelegt. Voreinstellung: qwen/qwen3.8-27b für beide Aufgaben, entsprechend der bei Implementierung abgerufenen Groq-Dokumentation. Modellverfügbarkeit und Berechtigungen im eigenen Konto können abweichen oder sich ändern. Bei einem Modellwechsel müssen Bildunterstützung und striktes JSON-Schema unterstützt werden. Es erfolgt kein stiller Wechsel auf ein anderes Modell.

AUF NETLIFY VORBEREITEN
1. Das gesamte entpackte Projekt in ein eigenes Repository übernehmen, nicht nur den Ordner dist. .env niemals ins Repository hochladen.
2. Das Repository in Netlify verbinden. Die beigefügte netlify.toml enthält publish=dist und functions=netlify/functions; ein Frontend-Build ist nicht erforderlich.
3. In Netlify GROQ_API_KEY und APP_ACCESS_CODE als serverseitige Umgebungsvariablen für Functions hinterlegen. Optional GROQ_TEXT_MODEL und GROQ_VISION_MODEL setzen.
4. Neu deployen, damit Functions und Umgebungsvariablen zusammen aktiv sind.
5. In der App Mehr → Groq einrichten prüfen: Server erreichbar; anschließend mit dem App-Zugangscode freischalten.
6. Mit einem einzelnen Textrezept und einem einzelnen Foto testen.
Ein reiner Drag-and-drop-Upload von dist stellt nur die Oberfläche bereit und reicht für die Groq-Funktionen nicht aus.

GRENZEN DER ERSTEN ANBINDUNG
- Höchstens drei Bilder oder ein PDF mit maximal drei Seiten pro KI-Import. Mehrseitige PDFs werden nicht still abgeschnitten: vorher auf das Rezept begrenzen.
- Maximal 12 MB je Originaldatei, 16 MB je Dateiauswahl. Bilder werden lokal auf längstens 1800 Pixel vorbereitet und bei Bedarf komprimiert; die Erkennbarkeit kann dadurch beeinträchtigt werden. Unveränderte Originaldateien bleiben separat erhalten.
- HEIC wird nicht verarbeitet; vorher JPEG/PNG verwenden.
- Mehrere ausgewählte Bilder werden als aufeinanderfolgende Seiten EINES Rezepts behandelt. Enthält eine Seite mehrere unabhängige Rezepte, soll nur das erste mit Hinweis erfasst werden.
- Handschrift, unscharfe Fotos, enge Tabellen und mehrspaltige Vorlagen können falsch erkannt werden. Fehlende Angaben nicht automatisch ergänzen lassen.
- Die Sammlung ist weiterhin browserlokal und wird nicht zwischen Geräten synchronisiert. Unter Mehr regelmäßig Backup herunterladen. In eingeschränkten Browsern kann nur Sitzungsspeicherung möglich sein.
- KI-Übertragung erfolgt ausschließlich nach Klick auf die jeweilige Aktion. Texte bzw. vorbereitete Bilder gehen über den eigenen Server an Groq. Der API-Schlüssel bleibt auf dem Server. Originaldateien werden nicht auf dem App-Server archiviert oder in Anwendungslogs geschrieben.
- Schutz für einen persönlichen Testbetrieb: App-Zugangscode, signiertes HttpOnly-Sitzungscookie, Herkunftsprüfung, Eingabe-/Bildvalidierung, Zeitlimits, maximal zwei gleichzeitige Anfragen und 12 KI-Anfragen pro Minute und Serverinstanz. Diese Begrenzung ist kein kontoübergreifendes Kostenbudget; bei Serverless-Betrieb können mehrere Instanzen existieren.

TESTS
Im Projektordner npm test ausführen.
16 automatisierte Tests bestanden: Zugangsschutz, Herkunftsprüfung, Textkorrektur, Bildanfrage, ungültige Eingaben, falsch zugeordnete Antworten, Originalbelege, Rezeptformat, Mengenänderungen, verspätete Antworten, Groq-Fehler/Limit/Timeout, abgeschnittene Antworten, Anfragenbudget und sichere Auslieferung der lokalen Bibliotheken.
Im Browser geprüft: Korrektur startet; fehlende Konfiguration wird verständlich angezeigt; Einstellungen lassen Bearbeitung bestehen; PDF-Seite wird als Bild mit Vorschau vorbereitet; Erkennung bleibt ohne API-Konfiguration explizit deaktiviert.
Nicht durchgeführt: echter Groq-Modellaufruf, Prüfung der Erkennungsqualität mit einem eigenen Konto, Netlify-Live-Deployment und Android-Kameratest.

OFFIZIELLE TECHNISCHE QUELLEN
https://console.groq.com/docs/vision
https://console.groq.com/docs/structured-outputs
https://console.groq.com/docs/api-reference
https://docs.netlify.com/build/functions/configuration/

PROJEKTSTRUKTUR
- dist/index.html: vollständige Web-App
- dist/vendor/: lokale JSZip-/PDF.js-Bibliotheken
- frontend-groq.js: dokumentierter Quellabschnitt der Groq-Oberfläche; die ausgelieferte Anwendung enthält ihn bereits in dist/index.html
- server/api.mjs: gemeinsame geschützte Groq-API und Validierung
- server/start.mjs: lokaler HTTP-Server
- server/static.mjs: Begrenzung statischer Dateizugriffe auf dist
- netlify/functions/api.mjs: Netlify-Adapter
- tests/: automatisierte Prüfungen ohne echten API-Zugriff
- .env.example: leere Vorlage für die serverseitigen Zugangsdaten
