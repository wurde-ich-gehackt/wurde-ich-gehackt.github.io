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

    var list = $('#table-results');
    var checkButton = $('#check-button');

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function checkHackedEmails(email) {
        var URL = 'https://hacked-emails.com/api?q=' + email;
        return $.get(URL);
    }

    function handleResults(results) {
        console.log(results);
        var data = results.hibp;
        var data2 = results.hackedEmails;
        try {
            checkButton.find('i').hide();
            if (data.length > 0 || data2.results > 0) {
              try {
                window.mixpanel.track("checked-found", {
                    hibp: data.length,
                    hackedEmails: data2.results
                });
              } catch (err) {}
              var summary = 'Es wurden ' + data.length + ' Einträge auf haveibeenpwned.com und ' + data2.results + ' auf hacked-emails.com gefunden.';
              summary += '<br><a href="#results">Ergebnisse anzeigen</a>'
              $('#found-amount').html(summary);
              $('#result').show();
              data.forEach(function(item) {
                var entry = "<tr><td>haveibeenpwned</td><td>" +
                    "<a target='haveibeenpwned' href='https://haveibeenpwned.com/PwnedWebsites#" +
                        item.Name + "'>" + item.Name + "</a></td><td>" +
                    item.DataClasses.join(', ') + "</td><td>" +
                    item.BreachDate + "</td><td>" +
                    item.AddedDate.substr(0, 10) + "</td><td>" +
                    item.PwnCount.toLocaleString() + "</td><td>" +
                    (item.IsVerified ? "<i title='verifiziert' class='fa fa-check'></i>" : "") + "</td><td>" +
                    "</td></tr>";
                list.append(entry);
              });
              data2.data.forEach(function(item) {
                var entry = "<tr><td>hacked-emails</td><td>" +
                    "<a target='hackedemails' href='" + item.details + "'>" +
                        item.title + "</a></td><td>" +
                    "</td><td>" +
                    item.date_leaked.substr(0, 10) + "</td><td>" +
                    "</td><td>" +
                    item.emails_count.toLocaleString() + "</td><td>" +
                    (item.verified ? "<i title='verifiziert' class='fa fa-check'></i>" : "") + "</td><td>" +
                    "</td></tr>";
                list.append(entry);
              });

              $('#result-found').show();
            } else {
              $('#result-ok').show();
              try {
                window.mixpanel.track("checked-nothing");
              } catch (err) {}
            }
        } catch (err) {
            console.error(err);
            $('#result-message').html('Es gab einen Fehler Verarbeitung des Ergebnisses der Datenabfrage:<br>' + err.toString());
            $('#result-status').show();   
        }
    }

    function triggerClickAndKey() {
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
            window.mixpanel.track("pess-button");
        } catch (err) {}
        
        var results = {};
        window.hibp
          .breachedAccount(email)
          .then(function(data) {
            results.hibp = data || [];
            return checkHackedEmails(email);
          }).then(function(data) {
            results.hackedEmails = data;
            handleResults(results);
          })
          .catch((err) => {
            checkButton.find('i').hide()
            // Something went wrong.
            console.error(err);
            $('#result-message').html('Es gab einen Fehler bei der Datenabfrage:<br>' + err.message);
            $('#result-status').show();
          });
    }

    setTimeout(() => {
        $('#check-email').focus();
    }, 1)

    $(document).keypress(function(e) {
        if (e.which == 13) {
            triggerClickAndKey();
        }
    });

    checkButton.click(function() {
        triggerClickAndKey();
    });
})(jQuery); // End of use strict
