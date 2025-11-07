// USER REQUEST FOR CODEWORD --> STARTS HERE  
let ergebnis = 			document.getElementById("result");  
let hide 		= 			document.getElementsByClassName("hide");   
let link =     			document.getElementById("verlinkung"); 
link.addEventListener("click",checkPass); // Eventhandler für checkPass setzen     

function checkPass() {
  var userInput = confirm("ACHTUNG: \n\nFalls Du ein Codewort erhalten hast, \nbitte klicke auf 'OK'. \n\n\Sonst, klicke bitte auf 'Abbrechen'.");  
  if (userInput == 1) {
    var codeword = prompt("\nBitte gib unser Codewort ein:\n");
    let stringHasNumbers = /\d/.test(codeword);
    let buchstabenanzahl = codeword.length;   
  
    if (stringHasNumbers) {
      alert("Unser Codewort enthält keine Nummern.\n\n" + "Dein Codeword sollte keine Nummern enthalten, \nsondern nur Buchstaben.\n\n\nEs lautet falsch: " + codeword + "\n\nTschüß!\n\n.");
    } else if (buchstabenanzahl > 10  || buchstabenanzahl < 1 ) {
      alert("Unser Codewort hat aber zwischen 1 und 10 Zeichen.\nTschüß!\nDein Codeword hat abweichend: " + buchstabenanzahl  + " Zeichen." );
    } else { 
      codewordCheck(codeword); // codewordCheck-function below this
    }
  }   //else { alert("Okay. \nTschüß!");   }
}

function codewordCheck(code) { 
  for (i=1; i<4; i++) { 
		
    validate = code.toLowerCase().replaceAll(" ", "") === "intern";
    if (validate) {
 	 		alert("\n\nKorrekt! \n\nDer Link wird Dir nun auf der Webseite angezeigt. \n\nKlicke jetzt auf OK.\n\n");            
      document.querySelectorAll('.code_for_url').forEach(function(el) { el.style.display = 'block'});  
      document.querySelectorAll('.hide').forEach(function(el) { el.style.display = 'none'}); 
      ergebnis.href = " https://drive.google.com/drive/folders/1WVo6Wt7yMNAFVDxZQor2dQduABj_oDRB?usp=drive_link";   
      // open new Window automatically (not requiered ui-wise)  // window.open('https://drive.google.com/drive/folders/1WVo6Wt7yMNAFVDxZQor2dQduABj_oDRB?usp=drive_link', '_blank');  	
      // Srcoll to result-Element automatically (not requiered ui-wise) // setTimeout(() => {  document.getElementById( 'interna' ).scrollIntoView({ behavior: "smooth"  })}, "300");
      return;
    } else if (i == 3) {
      alert("Keine weiteren Versuche. Du hast nicht das korrekte Codewort eingegeben. Statt dessen hast Du:  " + validate + " eingegeben. Tschüß!");
    } 
    else {
      code = prompt("Falsches Codewort! \n\nBisher hast Du: \n\n" + code + " ... eingegeben.\n\nEinen Versuch geben wir Dir noch: \n\n"); 
		  }
  }
}  
// USER REQUEST FOR CODEWORD --> ENDS HERE   
