Mailer <- R6::R6Class("Mailer", list(
  url = NULL,
  templatemjm = NULL,
  templatetxt = NULL,

  initialize = function (url = NA, templatemjm= NA, templatetxt = NA) {
    stopifnot(is.character(url), length(url) == 1, nchar(url) > 0)
    stopifnot(!is.null(templatemjm) || !is.na(templatemjm) || !is.null(templatetxt) || !is.na(templatetxt))
    self$url <- url
    self$templatemjm = templatemjm
    self$templatetxt = templatetxt
  },

  send = function(subject = NA, from = NA, to = NA, cc = NA, bcc = NA, context = NA, attachments = NA) {
    ## Start checks:
    stopifnot(is.character(subject), length(subject) == 1, nchar(subject) > 0)
    stopifnot(is.character(from), length(from) == 1, nchar(from) > 0)
    stopifnot(any(as.logical(Map(is.character, list(to, cc, bcc)))))
    stopifnot(any(as.numeric(Map(nchar, unlist(list(to, cc, bcc), recursive=TRUE))) > 0))

    ## Prepare the metadata:
    metadata <- list(subject = jsonlite::unbox(subject), from = jsonlite::unbox(from), to = to, cc = cc, bcc = bcc, context = context)

    ## Get the temporary directory path:
    tmpdir <- tempfile()

    ## Make the directory:
    dir.create(tmpdir)

    ## Write metadata and return the filepath:
    file_metadata <- self$.make_attachment(tmpdir, "_metadata.json", jsonlite::toJSON(metadata))

    ## Attempt to send:
    response <- httr::POST(self$url, body = self$.make_payload(file_metadata, attachments))

    ## Check status code:
    if(httr::status_code(response) != 200) {
      cat("Error while attempting to send email:\n")
      print(httr::content(response))
      stop("Couldn't send email.")
    }

    ## Return successful response:
    httr::content(response)
  },

  .make_attachment = function(tmpdir, filename, contents) {
    ## Build the target file path:
    filepath = sprintf("%s/%s", tmpdir, filename)

    ## Write contents to file:
    write(contents, file = filepath)

    ## Done, return with filepath:
    filepath
  },

  .make_payload = function (metadata, attachments) {
    ## Prepare body:
    body <- list(
      metadata = httr::upload_file(metadata)
    )

    ## Add templates:
    if (!is.null(self$templatemjm) & !is.na(self$templatemjm)) {
      body <- c(body, list(templatemjm = httr::upload_file(self$templatemjm)))
    }
    if (!is.null(self$templatetxt) & !is.na(self$templatetxt)) {
      body <- c(body, list(templatetxt = httr::upload_file(self$templatetxt)))
    }

    ## Add attachments:
    for (a in attachments) {
      body <- c(body, list(attachments = httr::upload_file(a)))
    }

    ## Done, return body:
    body
  }
))

mailer <- Mailer$new(
  url = "http://localhost:3300/sendmail",
  templatemjm = "_template.mjm.hbs",
  templatetxt = "_template.txt.hbs"
)

mailer$send(
  subject = "Example Email with MJML/HTML and TXT Content (R)",
  from = "\"Fatih Koksal <fatih@telostat.com>\"",
  to = c("ali@telostat.com", "Vehbi Sinan Tunalioglu <sinan@telostat.com>"),
  cc = "Vehbi Sinan Tunalioglu <vst@vsthost.com>",
  bcc = "fatihkoksal@gmail.com",
  context = list(
    title = "Sample Email",
    preview = "You have a new mail",
    logo = "https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png",
    body = "Dear User,\n\nWe are sending you this email because we would like to!\n\nSee the attachments for how much we care about you...\n\nLove,\nThe R Team",
    notes = "**Privacy Information:** Ullamco commodo magna dolor incididunt ex. Reprehenderit incididunt quis laborum culpa elit ad proident elit laborum sit Lorem culpa magna labore. Ipsum esse qui ad et excepteur nisi qui voluptate amet minim. Quis dolore cillum est eu in magna amet cupidatat anim nisi magna ea. Velit laborum officia est eiusmod eiusmod deserunt velit consequat.",
    footer = "6A Shenton Way, #04-01 OUE Downtown Gallery, Singapore 068815\nTelostat Pte Ltd"
  ),
  attachments = c("attachment1.txt", "attachment2.html")
)
