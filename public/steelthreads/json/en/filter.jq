  .[0] as $new
| .[1]
| ( ._attachments | select() ) = $new
