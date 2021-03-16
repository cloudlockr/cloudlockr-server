#! /bin/bash
heroku container:push web -a cloudlockr
heroku container:release web -a cloudlockr