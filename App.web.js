import React, { Component, useEffect, useState } from 'react'
import { getMonth } from './src_react/util';
import CalendarHeader from './src_react/components/CalendarHeader';
import Sidebar from './src_react/components/Sidebar';
import Month from './src_react/components/Month';
import axios from 'axios';
// import { parse } from '@babel/core';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import gapi from 'react-gapi';
// import logo from './logo.svg';
//import ApiCalendar from 'react-google-calendar-api';
//import { Button, View } from 'react-native';

var _title = ''
var _start = ''
var _end = ''
var _eventId = ''

function App() {
  // console.table(getMonth(3))
  const [loggedIn, setLoggedIn] = useState(false);

  var gapi = window.gapi
  var CLIENT_ID = "88262564393-247auf0fs74d92pggmbm5nfmprp6mesb.apps.googleusercontent.com"
  var API_KEY = "AIzaSyBuloUS31QvT13Wmz0HdmKA08Y4m3wTN5Y"
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
  // var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  var SCOPES = "https://www.googleapis.com/auth/calendar.events"

  function changeCalendar(change_events) {
    var containerEl = $('#external-events-list')[0];
    calendar = new FullCalendar.Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText.trim()
      }
    }
    });
    var calendarEl = $('#calendar1')[0];
    calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    locale: 'ko',
    editable: true,
    dayMaxEvents: 2,
    dayMaxEventRows: 2,
    contentHeight: 'auto',
    droppable: true,
    drop: function(arg) {
      arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    },
    events: change_events,
    dateClick:function(event) {
      onDisplay()
      change2('',event.dateStr)
      change3('',event.dateStr)
      $('#change').val('')
      $('#change2').val(event.dateStr)
      $('#change3').val(event.dateStr)
    },
    eventClick:function(event) {
      //event.event._context.options
      change2('',event.event.startStr)
      change3('',event.event.endStr)
      change4(event.event._def.defId)
      var yesterday = event.event.endStr
      if (event.event.startStr !== event.event.endStr && event.event.endStr.length < 11)
        yesterday = makeYesterday(event.event.endStr)
      const element = document.getElementById('eventsCenter')
      if (event.event.endStr === "")
        element.innerHTML = Display(event.event._def.title, event.event.startStr, event.event.startStr)
      else
        element.innerHTML = Display(event.event._def.title, event.event.startStr, yesterday)
      onDisplayM()
      //parseInt(), 0~3, 5~6, 8~9
      $('#change4').val(event.event._def.title)
      $('#change5').val(event.event.startStr)
      if (event.event.endStr === ""){
        $('#change6').val(event.event.startStr)
        console.log(event.event.endStr)
      }
      else if (event.event.startStr !== event.event.endStr && event.event.endStr.length < 11)
        $('#change6').val(yesterday)
    },
    });
    calendar.render();
  }

  const LoginOut = () => {
    gapi.auth.signOut(
      console.log('logout'),
      setLoggedIn(false),
    )
    changeCalendar([])
  }

  function change(e, title) {
    if ('' === e)
      _title = title
    else
      _title = e.target.value
  }
  function change2(e, start) {
    if ('' === e)
      _start = start
    else
      _start = e.target.value
  }
  function change3(e, end) {
    if ('' === e)
      _end = end
    else
      _end = e.target.value
  }
  function change4(eventId) {
    _eventId = eventId
  }

  function makeTomorrow(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    var t = new Date(year, month, day+1)
    var tomorrow = '';
    if (t.getMonth() < 10)
      tomorrow = t.getFullYear() + "-0" + t.getMonth()
    else
      tomorrow = t.getFullYear() + "-" + t.getMonth()
    if (t.getDate() < 10)
      tomorrow += "-0" + t.getDate()
    else
      tomorrow += "-" + t.getDate()
    return tomorrow
  }
  function makeYesterday(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    var y = new Date(year, month, day-1)
    var yesterday = '';
    if (y.getMonth() < 10)
      yesterday = y.getFullYear() + "-0" + y.getMonth()
    else
      yesterday = y.getFullYear() + "-" + y.getMonth()
    if (y.getDate() < 10)
      yesterday += "-0" + y.getDate()
    else
      yesterday += "-" + y.getDate()
    return yesterday
  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary', /* Can be 'primary' or a given calendarid */
      // 'timeMin': (new Date(2022/1/28)).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      // 'maxResults': 100,
      'orderBy': 'startTime'
    });
    
    request.execute(function(resp) {
      var events = resp.items;
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i];
          var start = event.start.dateTime;
          var end = event.end.dateTime;
          
          if (!start) {
            start = event.start.date;
            end = event.end.date;
          }
          new_events[i] = {
            title : event.summary,
            start : start,
            end : end,
          }
        }
      }
      console.log(new_events);
      
      // calendar.setOption('events', new_events)
      (function(){
        $(function(){
          changeCalendar(new_events)
        });
      })();
    });
  }

  /**
   * Load Google Calendar client library. List upcoming events
   * once client library is loaded.
   */
  function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      // Hide auth UI, then load client library.
      authorizeDiv.style.display = 'none';
      loadCalendarApi();
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      authorizeDiv.style.display = 'inline';
    }
  }

  /**
   * Initiate auth flow in response to user clicking authorize button.
   *
   * @param {Event} event Button click event.
   */
  function handleAuthClick(event) {
    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult)
      .then(() => {
        setLoggedIn(true);
      })
    return false;
  }

  function InsertEventsF(title, start, end) {
    var event = null;
    if (start.length > 11){
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }

    new_events[new_events.length] = {
      title: title,
      start: start,
      end: end,
    }
    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event,
    })
    request.execute(function(event) {
    })

    changeCalendar(new_events)
  }
  function updateEventsF(title, start, end, _eventId) {
    var event = null;
    if (start.length > 11){
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }

    // new_events[new_events.length] = {
    //   title: title,
    //   start: start,
    //   end: end,
    // }

    var event2 = gapi.client.calendar.events.get({"calendarId": 'primary', "eventId": booking.eventCalendarId});
    event2.location = "New Address";
    var request = gapi.client.calendar.events.patch({
      'calendarId': 'primary',
      'eventId': booking.eventCalendarId,
      'resource': event
    });
    request.execute(function(event) {
    })

    // changeCalendar(new_events)
  }
  function deleteEventsF(eventId) {
    //el.fcSeg.eventRange.def.defId
    console.log(eventId)

    var request = gapi.client.calendar.events.delete({
      'calendarId': 'primary',
      'eventId': eventId,
    });
    request.execute(function(event) {
    })
  }

  function onDisplay() {
    $('#insertEvents').show()
  }
  function offDisplay() {
    $('#insertEvents').hide()
  }

  function onDisplayM() {
    $('#mainEvents').show()
  }
  function offDisplayM() {
    $('#mainEvents').hide()
  }

  function onDisplayU() {
    $('#mainEvents').hide()
    $('#updateEvents').show()
  }
  function offDisplayU() {
    $('#updateEvents').hide()
  }

  function insertDisplay() {
    if ( _end.length < 11)
      InsertEventsF(_title, _start, makeTomorrow(_end))
    else 
      InsertEventsF(_title, _start, _end)
    $('#insertEvents').hide()
  }
  function updateDisplay() {
    if ( _end.length < 11)
    updateEventsF(_title, _start, makeTomorrow(_end), _eventId)
  else 
    updateEventsF(_title, _start, _end, _eventId)
    $('#insertEvents').hide()
  }
  function deleteDisplay() {
    deleteEventsF(_eventId)
    $('#insertEvents').hide()
  }

  function Display(title, start, end) {
    // return '<p>' + start + '</p><p>' + end + '</p>'
    return '<p>' + title + '</p><p>' + start + '</p><p>' + end + '</p>'
  }

  const insertStyle = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 999,
  }

  if (loggedIn) {
    return (
      <div className='App'>
        <header className='App-header'>
          <div id='insertEvents' style={insertStyle}>
            <button onClick={offDisplay}>x</button>
            <button onClick={insertDisplay}>o</button>
            <p><input id="change" name="text" placeholder='(제목 및 시간 추가)' onChange={change} /></p>
            <p><input id="change2" name="text" onChange={change2} /></p>
            <p><input id="change3" name="text" onChange={change3} /></p>
          </div>

          <div id='mainEvents' style={insertStyle}>
            <button onClick={offDisplayM}>x</button>
            <button onClick={onDisplayU}>update</button>
            <div id='eventsCenter'></div>
          </div>

          <div id='updateEvents' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={updateDisplay}>o</button>
            <button onClick={deleteDisplay}>delete</button>
            <p><input id="change4" name="text" onChange={change} /></p>
            <p><input id="change5" name="text" onChange={change2} /></p>
            <p><input id="change6" name="text" onChange={change3} /></p>
          </div>
          <div id='wrap'>
            <div id='external-events'>
              <div id='external-events-list'></div>
            </div>
            <div id='calendar-wrap'>
              <div id='calendar1'></div>
            </div>
          </div>
          <button onClick={LoginOut}>logout</button>
        </header>
      </div>
    );
  }
  return (
    <div className='App'>
      <div id="authorize-div">
        <button id="authorize-button" onClick={() => handleAuthClick(event)}>Login</button>
      </div>
    </div>
  );
}

export default App;

// import React from 'react'
// import {View, Text} from 'react-native';

// function App() {
//   return (
//     <View>
//       <Text>Hello world from react</Text>
//     </View>
//   )
// }

// export default App