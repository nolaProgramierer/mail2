document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  'use strict';
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  'use strict';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      for (let i = 0; i < emails.length; i++) {
        // Create div for email
        var email_div = document.createElement('div');
        email_div.className = 'list-email';
        // If email attribute == 'read', change background color
        if (emails[i].read === true) {
          email_div.classList.add('read-email');
        }
        // Add HTML to div
        email_div.innerHTML = `From: ${emails[i].sender} Subj: ${emails[i].subject} Sent at: ${emails[i].timestamp}`;

        // Add event listener to element for show individual email with closure
        (function () {
          email_div.addEventListener('click', function () {
            show_email(emails[i].id);
          }, false);
        }());

        // Add event listener to element for reply function with closure
        (function () {
          document.querySelector('#reply-button').addEventListener('click', function () {
            reply_to_email(emails[i].id);
          }, false);
        }());
        // Append to Inbox view
        document.querySelector('#emails-view').append(email_div);
      }
    });

  /*
   Alternate way to assign eventListener
  document.querySelectorAll('.list-email').forEach(function (node, index) {
    node.addEventListener('click', function () {
      show_email(index);
    });
  });
  */
}

function send_mail(e) {
  var send_recipients = document.querySelector('#compose-recipients').value;
  var send_subject = document.querySelector('#compose-subject').value;
  var send_body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: send_recipients,
      subject: send_subject,
      body: send_body
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });

  e.preventDefault();
  load_mailbox('sent');
}

// Display email from inbox
function show_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = "block";

  // Get email by email id
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      var sender = email.sender;
      var recipients = email.recipients;
      var subject = email.subject;
      var timestamp = email.timestamp;
      var body = email.body;



      document.querySelector('#email-from').innerHTML = `From: ${sender}`;
      document.querySelector('#email-to').innerHTML = `To: ${recipients}`;
      document.querySelector('#email-subject').innerHTML = `Re: ${subject}`;
      document.querySelector('#email-timestamp').innerHTML = `Timestamp: ${timestamp}`;
      document.querySelector('#email-body').innerHTML = body;

      // Mark email as read if not read
      if (!email.read) {
        mark_as_read(id);
      }
      // Hide unarchive button is email not archived
      if (email.archived) {
        document.querySelector('#archive').style.visibility = 'hidden';
        document.querySelector('#unarchive').style.visibility = 'visible';
        // Add eventlistener to unarchive button
        document.querySelector('#unarchive').addEventListener('click', function () {
          unarchive_email(id);
        });
      } else if (!email.archived) {
        // Hide unarchive button
        document.querySelector('#unarchive').style.visibility = 'hidden';
        document.querySelector('#archive').style.visibility = 'visible';
        // Archive email onclick
        document.querySelector('#archive').addEventListener('click', function () {
          archive_email(id);
        });
      }
    });
}


// Change email 'read' attribute
function mark_as_read(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  });
}


// Change email 'archive' attribute
function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  load_mailbox('inbox');
  console.log("email archived");
}


// Unarchive email
function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });
  load_mailbox('inbox');
  console.log("email unarchived");
}


// Reply to email
function reply_to_email(id) {
  // Show email view
  compose_email();
  document.querySelector('#email-view').style.display = 'none';

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      let body_msg = `On ${email.timestamp} ${email.sender} wrote: `;
      // Check for existing 'Re:' in Subject field
      if (document.querySelector('#compose-subject').value.slice(0, 3) === 'Re:') {
        document.querySelector('#compose-subject').value = email.subject;
      }
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-body').value = body_msg + email.body;
    });
}

