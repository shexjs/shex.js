// Convert ShEx to FHIR Logical Tables

// Global configuration and control variables.
var TOGGLE_TIME = 50 // time in μsec to toggle collapsed lists.
var RENDER_DELAY = 10 // time to pause for display (horrible heuristics). Could try: .css('opacity', .99)
var BUILD_PRODUCTS = true // can disable if OWL and ShEx construction crashes.
var SUPPRESS_DUPLICATE_CLASSES = true // Don't list subclasses in parent's package.
var UPPER_UNLIMITED = '*'

const UPCLASS = 'extends up'

var Getables = [
];

function prepareControls () {
  $("#menu-button").on("click", toggleControls);
  // $("#interface").on("change", setInterface);
  // $("#regexpEngine").on("change", toggleControls);
  // $("#validate").on("click", disableResultsAndValidate);
  // $("#clear").on("click", clearAll);
  // $("#download-results-button").on("click", downloadResults);

  $("#loadForm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "GET": function (evt, ui) {
        results.clear();
        var target = Getables.find(g => g.queryStringParm === $("#loadForm span").text());
        var url = $("#loadInput").val();
        var tips = $(".validateTips");
        function updateTips (t) {
          tips
            .text( t )
            .addClass( "ui-state-highlight" );
          setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
          }, 500 );
        }
        if (url.length < 5) {
          $("#loadInput").addClass("ui-state-error");
          updateTips("URL \"" + url + "\" is way too short.");
          return;
        }
        tips.removeClass("ui-state-highlight").text();
        target.cache.asyncGet(url).catch(function (e) {
          updateTips(e.message);
        });
      },
      Cancel: function() {
        $("#loadInput").removeClass("ui-state-error");
        $("#loadForm").dialog("close");
        toggleControls();
      }
    },
    close: function() {
      $("#loadInput").removeClass("ui-state-error");
      $("#loadForm").dialog("close");
      toggleControls();
    }
  });
  Getables.forEach(target => {
    var type = target.queryStringParm
    $("#load-"+type+"-button").click(evt => {
      var prefillURL = target.url ? target.url :
          target.cache.meta.base && target.cache.meta.base !== DefaultBase ? target.cache.meta.base :
          "";
      $("#loadInput").val(prefillURL);
      $("#loadForm").attr("class", type).find("span").text(type);
      $("#loadForm").dialog("open");
    });
  });

  $("#about").dialog({
    autoOpen: false,
    modal: true,
    width: "50%",
    buttons: {
      "Dismiss": dismissModal
    },
    close: dismissModal
  });

  $("#about-button").click(evt => {
    $("#about").dialog("open");
  });

  function dismissModal (evt) {
    // $.unblockUI();
    $("#about").dialog("close");
    toggleControls();
    return true;
  }

  // Prepare file uploads
  $("input.inputfile").each((idx, elt) => {
    $(elt).on("change", function (evt) {
      var reader = new FileReader();

      reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
          alert("Error while reading file");
          return;
        }
        $($(elt).attr("data-target")).val(evt.target.result);
      };

      reader.readAsText(evt.target.files[0]);
    });
  });
}

function toggleControls (evt) {
  var revealing = evt && $("#controls").css("display") !== "flex";
  $("#controls").css("display", revealing ? "flex" : "none");
  toggleControlsArrow(revealing ? "up" : "down");
  if (revealing) {
    var target = evt.target;
    while (target.tagName !== "BUTTON")
      target = target.parentElement;
    if ($("#menuForm").css("position") === "absolute") {
      $("#controls").
        css("top", 0).
        css("left", $("#menu-button").css("margin-left"));
    } else {
      var bottonBBox = target.getBoundingClientRect();
      var controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
      var left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
      $("#controls").css("top", bottonBBox.bottom).css("left", left);
    }
    $("#permalink a").attr("href", getPermalink());
  }
  return false;
}

function toggleControlsArrow (which) {
  // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
  if (document.getElementById("menu-button") === null)
    return;
  var down = $(document.getElementById("menu-button").
               querySelectorAll('use[*|href="#down-arrow"]'));
  var up = $(document.getElementById("menu-button").
             querySelectorAll('use[*|href="#up-arrow"]'));

  switch (which) {
  case "down":
    down.show();
    up.hide();
    break;
  case "up":
    down.hide();
    up.show();
    break;
  default:
    throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
  }
}

function main () {
  let $ = window.jQuery

  $('#load-file').on('change', function (evt) {
    if (!window.FileReader) {
      return // not supported
    }
    for (let i = 0; i < evt.target.files.length; ++i) {
      (function (file) {
        // Give user some interface feedback before reading.
        let div = $('<div/>', {'id': file.name}).appendTo('#loaded')
        $('<li/>').append($('<a/>', {href: '#' + file.name}).text(file.name)).appendTo('#toc')
        let status = $('<span/>').addClass('status').text('loading...')
        $('<h2/>').append(file.name, status).appendTo(div)
        window.setTimeout(() => {
          let loader = new window.FileReader()
          loader.onload = function (loadEvent) {
            if (loadEvent.target.readyState !== 2) {
              console.dir(loadEvent)
              return
            }
            if (loadEvent.target.error) {
              window.alert('Error while reading file ' + file.name + ': ' + loadEvent.target.error)
              return
            }
            // This may take a long time to render.
            $('<textarea/>', {cols: 60, rows: 10}).val(loadEvent.target.result).appendTo(div)
            renderSchema(loadEvent.target.result, 'uploaded ' + file.name + ' ' + new Date().toISOString(), status, $('#namespace').val())
          }
          loader.readAsText(file)
        }, RENDER_DELAY)
      })(evt.target.files[i])
    }
  })

  $('#load-url').on('change', function (evt) {
    let source = $(this).val()
    // Give user some interface feedback before reading.
    let div = $('<div/>', {'id': source}).appendTo('#loaded')
    $('<li/>').append($('<a/>', {href: '#' + source}).text(source)).appendTo('#toc')
    let status = $('<span/>').addClass('status').text('fetching...')
    $('<h2/>').append(source, status).appendTo(div)
    window.fetch(source).then(function (response) {
      if (!response.ok) {
        throw Error('got ' + response.status + ' ' + response.statusText)
      }
      return response.text()
    }).then(function (text) {
      window.setTimeout(() => {
        $('<textarea/>', {cols: 60, rows: 10}).val(text).appendTo(div)
        renderSchema(text, 'fetched ' + source + ' ' + new Date().toISOString(), status, $('#namespace').val())
      }, RENDER_DELAY)
    }).catch(function (error) {
      div.append($('<pre/>').text(error)).addClass('error')
    })
    return true
  })
  prepareControls()

  function renderSchema (schemaText, source, status, namespace) {
    console.log(source, status)
    let shexParser = ShEx.Parser.construct($('#namespace').val())
    let schema = shexParser.parse(schemaText)
    console.dir(schema)
    let schemaBox = $('<div/>')
    $('.render').append(schemaBox)
    schemaBox.append(
      $('<dl/>', { class: 'prolog' }).append(
        $('<dt/>').text('base'),
        $('<dd/>').text(schema.base),
        $('<dt/>').text('prefixes'),
        $('<dd/>').append(
          $('<dl/>', { class: 'prolog' }).append(
            Object.keys(schema.prefixes).reduce(
              (acc, prefix) => acc.concat(
                $('<dt/>').text(prefix),
                $('<dd/>').text(schema.prefixes[prefix]),
              ), [])
          )
        ),
      ),
      Object.keys(schema.shapes).map(
        shapeLabel => $('<table/>').append(
          renderShapeExpr(schema.shapes[shapeLabel], '', renderShapeDecl(shapeLabel))
        )
      )
    )

    function renderShapeDecl (shapeLabel) {
      return $('<tr/>').append(
        $('<td/>', {id: trim(shapeLabel)}).text(trim(shapeLabel)),
        $('<td/>'),
        $('<td/>')
      )
    }

    function renderShapeExpr(expr, lead, decl) {
      let top = [decl]
      switch (expr.type) {
      case 'Shape':
        if ('extends' in expr) {
          // Update the decl with the first extends.
          decl.find('td:nth-child(2)').append(ref(expr.extends[0]))

          // Each additional extends gets its own row.
          top = top.concat(expr.extends.slice(1).map(
            ext => $('<tr/>').append(
              $('<td/>').text(lead + '│' + '   '),
              $('<td/>').append(ref(ext)),
              $('<td/>')
            )
          ))

          function ref (ext) {
            return $('<a/>', {href: '#' + trim(ext), class: UPCLASS}).text(trim(ext))
          }
        }
        return top.concat(renderTripleExpr(expr.expression, lead, false))
      case 'ShapeDecl':
        return renderShapeExpr(expr.shapeExpr, lead, decl) // !!! do something with 'abstract'
      case 'NodeConstraint':
        return top.concat([$('<tr><td>...</td><td>' + JSON.stringify(expr) + '</td><td></td></tr>')])
      default:
        throw Error('renderShapeExpr has no handler for ' + JSON.stringify(expr, null, 2))
      }
    }

    function renderTripleExpr(expr, lead, last) {
      switch (expr.type) {
      case 'EachOf':
        return expr.expressions.reduce(
          (acc, nested, i) => acc.concat(renderTripleExpr(nested, lead, i === expr.expressions.length - 1)), []
        )
      case 'TripleConstraint':
        let decl = $('<tr/>').append(
          $('<td/>').append(
            lead,
            last ? '└' :  '├',
            $('<span/>').text(expr.valueExpr.type === 'NodeConstraint' ? '▭' : '▻').css(
              {
                display: 'inline-block',
                width: '.9em',
                'margin-left': '-.05em',
                'text-align': 'left'
              }
            ),
            trim(expr.predicate)),
          $('<td/>').text(renderEmbeddedShape(expr.valueExpr)),
          $('<td/>').text(renderCardinality(expr))
        )
        return renderNestedShape(expr.valueExpr, lead + (last ? '   ' : '│') + '   ', decl)
      default:
        throw Error('renderShapeExpr has no handler for ' + expr.type)
      }
    }

    function renderEmbeddedShape (valueExpr) {
      return valueExpr.type === 'NodeConstraint'
        ? trim(valueExpr.datatype)
        : valueExpr.type === 'ShapeRef'
        ? trim(valueExpr.reference)
        : ''
    }

    function renderNestedShape (valueExpr, lead, decl) {
      if (valueExpr.type !== 'Shape') {
        return decl
      }
      return renderShapeExpr(valueExpr, lead, decl)
    }

    function renderCardinality (expr) {
      let min = 'min' in expr ? expr.min : 1
      let max = 'max' in expr ? expr.max : 1
      return min === 0 && max === 1
        ? '?'
        : min === 0 && max === -1
        ? '*'
        : min === 1 && max === 1
        ? ''
        : min === 1 && max === -1
        ? '+'
        : '{' + min + ',' + max + '}'
    }

    function trim (iri) {
      if (iri.startsWith(namespace))
        return iri.substr(namespace.length)
      for (var prefix in schema.prefixes) {
        if (iri.startsWith(schema.prefixes[prefix])) {
          return prefix + ':' + iri.substr(schema.prefixes[prefix].length)
        }
      }
      return iri
    }
  }
}

window.onload = main
