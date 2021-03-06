## 1.3.1 (2018-06-10)

* modify to disable fetch timeout because the issue where tab crashed using fetch() on Windows

## 1.3.0 (2018-06-10)

* modify to play mp4 video in a post

## 1.2.1 (2018-04-01)

* change to handle threads on load a catalog
* change to handle threads on update a catalog
* change to search all threads instead of threads in a catalog
* improve to search threads on update catalog if set query

## 1.2.0 (2018-03-21)

* add a feature to link strings like siokarabin URL in posts
* modify not to replace too short No with No quote
* modify color of anchor in quoted post

## 1.1.0 (2018-03-19)

* add a feature to link strings like URL in posts
* add a feature to filter posts in a thread
* change not to merge ID/IP of a post when there was no exposed ID/IP
* fix an issue where could not display a catalog of img.2chan.net

## 1.0.1 (2018-03-17)

* improve catalog search
* fix to ignore blank query in catalog search
* change properties of state
* update dependent modules

## 1.0.0 (2018-02-25)

* publish gohei-mochi on AMO
* add a feature to search catalog
* fix to set domain and path of cookie (namec and pwdc) correctly
* modify to display expire in thread console

## 0.4.0 (2018-02-17)

* change tab title on thread panel
* change to handle preferences
* tweak height of delreq reasons pane on thread panel
* change build process on tasks to sign a Firefox addon

## 0.3.1 (2018-02-05)

* modify to merge a delete message when a post file is deleted
* fix to work that worker run correctly

## 0.3.0 (2018-02-04)

* add a feature to delete posts 
* modify to collapse sequences of whitespace in post blockquote
* modify to use window.performance instead of stopwatch
* fix to parse expire correctly when expire is over next month

## 0.2.1 (2018-01-25)

* fix not to close post form on click in panel
* fix the issue that cannot attach a file by drag and drop
* fix to focus textarea correctly in post-form

## 0.2.0 (2018-01-24)

* change to use React instead of preact
* change to use Babel 7
* add to attach a image from clipboard on post form (only Firefox)
* remove tegaki-link on post form because the feature is not implemented

## 0.1.1 (2018-01-21)

* modify to adjust a popup position

## 0.1.0 (2018-01-18)

* add to popup posts by userId or userIp
* use a original post thumb to display tab icon
* improve to display ads
* change DEL and soudane so that text can be selected with mouse
* modify to return true on a listener passed to onMessage() in background

## 0.0.5 (2018-01-16)

* adjust video size when display video
* update a document

## 0.0.4 (2018-01-16)

* display webm movie with inline
* modify to get latest catalog preferences before update catalog
* change structore of model/preferences and to handle state.ui.preferences
* change to handle icons as file rather than js code
* change build tasks

## 0.0.3 (2018-01-14)

* change to download a post image when click a image filename
* fix to merge delete message on content/model/post/merge

## 0.0.2 (2018-01-12)

* display delreq tab on panel when click DEL
* fix to handle change of Body component correctly
* fix docs

## 0.0.1 (2018-01-11)

* initial release
