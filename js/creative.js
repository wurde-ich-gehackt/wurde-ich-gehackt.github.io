(function($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: (target.offset().top - 48)
                }, 1000, "easeInOutExpo");
                return false;
            }
        }
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
        target: '#mainNav',
        offset: 48
    });

    // Closes responsive menu when a link is clicked
    $('.navbar-collapse>ul>li>a').click(function() {
        $('.navbar-collapse').collapse('hide');
    });

    // Collapse the navbar when page is scrolled
    $(window).scroll(function() {
        if ($("#mainNav").offset().top > 100) {
            $("#mainNav").addClass("navbar-shrink");
        } else {
            $("#mainNav").removeClass("navbar-shrink");
        }
    });

    // Scroll reveal calls
    window.sr = ScrollReveal();
    sr.reveal('.sr-icons', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 200);
    sr.reveal('.sr-button', {
        duration: 1000,
        delay: 200
    });
    sr.reveal('.sr-contact', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 300);

    // Magnific popup calls
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
        }
    });

    /* 
     * Custom Code
     */

    function feedback(data) {
        if (data == null) {

        }
    }
    var checkButton = $('#check-button');

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    checkButton.click(function() {
        var list = $('#found-list');
        // reset
        list.empty();
        $('#result-status').hide();
        $('#result-ok').hide();
        $('#result-found').hide();

        var email = $('#check-email').val().trim();
        if (email.length === 0 || !validateEmail(email)) {
            $('#result-message').text('Die E-Mail Adresse ist ungültig');
            $('#result-status').show();
            return
        }
        $('#result-status').hide();
        checkButton.find('i').show();
        try {
            window.woopra.track("check-button");
        } catch (err) {}
        
        window.hibp
          .breachedAccount(email)
          .then((data) => {
            try {
                checkButton.find('i').hide();
                if (data) {
                  console.log(data);
                  try {
                    window.woopra.track("check", {found: true});
                  } catch (err) {}
                  if (data.length > 1) {
                    $('#found-amount').text('wurden' + data.length + ' Einträge');
                  } else {
                    $('#found-amount').text('wurde 1 Eintrag');
                  }
                  
                  data.forEach(function(item) {
                    var item = "<li><a target='blank' href='http://" + item.Domain + "'>" +
                     item.Name + "</a>, Diebstahl: " + item.BreachDate + ", Veröffentlichung: "
                      + item.AddedDate.substr(0, 10) + ", Daten: " 
                      + item.DataClasses.join(', ') + ",  <a target='haveibeenpwned' href='https://haveibeenpwned.com/PwnedWebsites#" 
                      + item.Name + "'><i title='Quelle' class='fa fa-info'></i></a></li>";
                    list.append(item)
                  })
                  $('#result-found').show();
                } else {
                  $('#result-ok').show();
                  try {
                    window.woopra.track("check", {found: false});
                  } catch (err) {}
                }
            } catch (err) {
                console.error(err);
                $('#result-message').html('Es gab einen Fehler Verarbeitung des Ergebnisses der Datenabfrage:<br>' + err.toString());
                $('#result-status').show();   
            }
          })
          .catch((err) => {
            checkButton.find('i').hide()
            // Something went wrong.
            console.log(err.message);
            $('#result-message').text('Es gab einen Fehler bei der Datenabfrage:' + err.message);
            $('#result-status').show();
          });
    });
})(jQuery); // End of use strict
