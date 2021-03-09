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

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      for (let i = 0; i < emails.length; i++) {

        console.log(emails[i]);

        // Create div for email
        var email_div = document.createElement('div');
        email_div.className = 'list-email';
        // If email attribute == read, change background color
        if (emails[i].read === 'True') {
          email_div.classList.add('read-email');
        }
        // Add HTML to div
        email_div.innerHTML = `From: ${emails[i].sender} Subj: ${emails[i].subject} Sent at: ${emails[i].timestamp}`;
        // Append to Inbox view
        // Add event listener to element with closure
        (function () {
          email_div.addEventListener('click', function () {
            show_email(emails[i].id);
          }, false);
        }());
        document.querySelector('#emails-view').append(email_div);

      }
    });
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
  console.log(`This email with id: ${id} has been clicked!`);
}