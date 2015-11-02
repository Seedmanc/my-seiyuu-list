angular.module("myApp", []).config(["$interpolateProvider", function(e) {
	e.startSymbol("[["), e.endSymbol("]]")
}]).filter("object2Array", function() {
	return function(e) {
		var t = []
		for (i in e) t.push(e[i])
		return t
	}
}).controller("myCtrl", ["$scope", "$http", function(e) {
	function t() {
		$("#disqus_thread").toggle(), v || $.ajax({
			type: "GET",
			url: "http://seedmanc.disqus.com/embed.js",
			dataType: "script",
			cache: !0
		}).done(function() {
			v = !0
		})
	}

	function i() {
		$(window).width() < 768 ? ($(".well").addClass("under768"), $(
			"table.text-center").addClass("under768"), $("#rolesTable").addClass(
			"table-condensed")) : ($(".well").removeClass("under768"), $(
			"table.text-center").removeClass("under768"), $("#rolesTable").removeClass(
			"table-condensed"))
	}

	function n(t, i, n, s, a) {
		var r = "collections/" + t "runCommand" == i && (r = i, i = "POST"),
			s = s || []
		var o = ""
		$.each(s, function(e, t) {
			o += "&%" + e.charCodeAt(0).toString(16) + "=" + encodeURIComponent(
				JSON.stringify(t))
		})
		var u
		t && ~i.indexOf("T") && (u =
				"%66%59%6a%45%4a%6f%4d%35%61%52%69%4a%6e%72%4c%4b"), $("#spinner").show(),
			f = setTimeout(function() {
				$("#spinner").hide()
			}, 1e4), $.ajax({
				url: "https://api.mongolab.com/api/1/databases/myseiyuulist/" + r +
					"\x3f%61%70\x69%4b%65%79\x3d%52%34\x6a\x67%38\x71%71%68\x70%54%49%36\x38%6c\x52%59" +
					u + o,
				data: JSON.stringify(n),
				type: i,
				contentType: "application/json"
			}).done(function(t) {
				e.debug += t.error || "", (a || angular.noop)(t)
			}).fail(function(t) {
				e.debug += JSON.stringify(t)
			}).always(function() {
				e.$apply(), $("#spinner").hide()
			})
	}

	function s() {
		if (!$("#pics").is(":visible")) return void $("span.thumb").remove()
		var t = 0,
			i = $.map(e.seiyuu, function(e, i) {
				return t++, i.replace(/ou\s|ou$/i, "o ").trim().replace(/uu/i, "u").replace(
					" ", "_")
			}).join("+")
		return t ? ($("#nav").show(), 1 == t && (i += "+solo"), m > 0 ? $("#prev")
			.show() : $("#prev").hide(), void $("#thumbContainer").load(
				"http://crossorigin.me/http://koe.booru.org/index.php?page=post&s=list&tags=" +
				i + "&pid=" + m + " div.content span.thumb",
				function(e, t, n) {
					a(i, e, t, n)
				})) : void $("#nav").hide()
	}

	function a(t, i, n, s) {
		if ("error" == n) return void(e.debug += s.status + " " + s.statusText)
		var r = $("span.thumb")
		if (r.addClass("img-thumbnail"), r.find("a").each(function(e, t) {
				t.href = $(t).find("img").attr("src").replace("thumbs", "img").replace(
						"thumbnails", "images").replace("thumbnail_", ""), t.target =
					"_blank"
			}), 0 == r.length && ~t.indexOf("solo")) return void $("#thumbContainer")
			.load(
				"http://crossorigin.me/http://koe.booru.org/index.php?page=post&s=list&tags=" +
				t.replace("+solo", "") + "&pid=" + m + " div.content span.thumb",
				function(e, i, n) {
					a(t.replace("+solo", ""), e, i, n)
				})
		if (r.length < 20) {
			var o = "~" + t.replace("+solo", "").replace(/\+/, "+~")
			$("#next").hide(), r.last().after(
				'<span class="thumb">more at  <b><a href="http://koe.booru.org/index.php?page=post&s=list&tags=' +
				o + '">koe.booru.org</a></b></span>')
		} else $("#next").show()
	}

	function r(t) {
		var i = (e.vanames[t] || e.vanames[t.split(" ").reverse().join(" ")])._id
		n("seiyuu", "runCommand", {
			findAndModify: "seiyuu",
			query: {
				_id: i
			},
			update: {
				$inc: {
					hits: 1
				}
			},
			"new": !0
		}, {}, function(t) {
			e.searchQuery = t.value.name.toLowerCase()
			var i = Date.parse(t.value.updated) / 1e3,
				n = Date.parse((new Date).toUTCString()) / 1e3
			return Math.abs(n - i) > 2592e3 || h ? void o("http://" + e.theSite +
				"/people/" + t.value._id, "", !0) : (t.value.titles = {}, $.each(t.value
					.roles,
					function(e, i) {
						(!t.value.titles[i._id] || i.main) && (t.value.titles[i._id] = {
							_id: i._id,
							main: i.main
						})
					}), delete t.value.roles, e.seiyuu[t.value.name.toLowerCase()] = t.value,
				void(e.pics[e.searchQuery] || (t.value.pic ? e.pics[e.searchQuery] =
					"http://" + e.theSite + t.value.pic : u(e.searchQuery))))
		})
	}

	function o(t, i, n) {
		$("#spinner").show(), f = setTimeout(function() {
			$("#spinner").hide()
		}, 1e4), i && (t = t + "?q=" + encodeURI(i)), $.ajax({
			url: "https://query.yahooapis.com/v1/public/yql",
			data: {
				q: "SELECT * FROM html WHERE url = '" + t +
					'\' AND xpath IN (\'//div[@id = "contentWrapper"]/h1[1]\',\'//div[@id = "content"]//form[@name = "searchVA"]/following::table[1]//tr\',\'//div[@id = "content"]/table/tbody/tr/td[2]/div[@class = "normal_header"][1]/following-sibling::*[1]//tr\',\'//div[@id = "content"]/table/tbody/tr/td/div/img\',\'//div[@id = "content"]/table/tbody/tr/td[2]/div[2]/div[3]/a\')',
				format: "json"
			},
			dataType: "json",
			type: "GET"
		}).done(function(t) {
			e.parseResults(t, n)
		}).fail(function(t) {
			e.debug = JSON.stringify(t)
		}).always(function() {
			e.disabled = !1, e.$apply()
		}), e.disabled = !0, e.$apply()
	}

	function u(t, i, n, s) {
		if (!e.pics[t] && e.pics[t] !== !1) {
			i = "http://" + e.theSite + i
			var a = "div.content span.thumb img",
				r = "~" + t.replace(/\s/g, "_") + "+~" + t.split(" ").reverse().join("_") +
				"+-drawing"~t.search(/ou\s|ou$/i) && (r += "+~" + t.replace(/ou\s|ou$/i,
					"o ").trim().replace(/\s/g, "_")),
				~t.search(/uu/i) && (r += "+~" + t.replace(/uu/i, "u").replace(/\s/g,
					"_")), ~t.search(/ou\s|ou$/i) && ~t.search(/uu/i) && (r += "+~" + t.replace(
					/ou\s|ou$/i, "o ").trim().replace(/uu/i, "u").replace(/\s/g, "_")), $.get(
					"http://crossorigin.me/http://koe.booru.org/index.php?page=post&s=list&tags=" +
					r).done(function(r) {
					thumbs = $(r).find(a), thumbs.length ? (solo = thumbs.filter(
							'[title*="solo"]:first'), solo.length ? e.pics[t] = solo[0].src : e
						.pics[t] = thumbs[0].src) : e.pics[t] = i || !1, e.pics[t.split(" ")
						.reverse().join(" ")] = e.pics[t], n && c(t, n, s)
				}).fail(function(n) {
					e.debug += JSON.stringify(n), e.pics[t] = i, e.pics[t.split(" ").reverse()
						.join(" ")] = e.pics[t]
				}).always(function() {
					e.$apply()
				})
		}
	}

	function c(t, i, s) {
		var a = ~e.pics[t].indexOf(e.theSite) ? e.pics[t].split(e.theSite)[1] : ""
		if (e.vanames[t] && !s) n("seiyuu", "PUT", {
			$inc: {
				hits: 1
			}
		}, {
			q: {
				_id: e.vanames[t]._id
			}
		})
		else {
			var r = e.seiyuu[t]
			n("seiyuu", "POST", {
				_id: r._id,
				name: r.name,
				pic: a,
				count: r.count,
				hits: 1,
				roles: i,
				updated: (new Date).toUTCString()
			}, function(t) {
				e.vanames[t.name.toLowerCase()] = {
					_id: t._id,
					hits: t.hits
				}
			}), l(t)
		}
	}

	function l(t) {
		var i = $.map(e.seiyuu[t].titles, function(e, t) {
			return +t
		})
		n("anime", "GET", void 0, {
			q: {
				_id: {
					$in: i
				}
			},
			f: {
				_id: 1
			}
		}, function(e) {
			var n = $.map(e, function(e) {
				return +e._id
			}) || []
			d(n, i, t)
		})
	}

	function d(t, i, s) {
		var a = $(i).not(t).get() || []
		if (t.length && (t = $.map(t, function(e) {
				return +e
			}), n("anime", "PUT", {
				$addToSet: {
					vas: e.seiyuu[s]._id
				}
			}, {
				q: {
					_id: {
						$in: t
					}
				},
				m: !0
			})), a.length) {
			var r, o = []
			$.each(a, function(t, i) {
				var n = e.seiyuu[s].titles[i]
				r = [], r[0] = +e.seiyuu[s]._id, o.push({
					_id: n._id,
					title: n.title,
					pic: n.pic,
					vas: r
				})
			}), n("anime", "POST", o)
		}
	}
	e.orderByField = "title", e.reverseSort = !1, e.theSite =
		"\x6d\x79\x61\x6e\x69\x6d\x65\x6c\x69\x73\x74\x2e\x6e\x65\x74", e.commonRoles = {},
		e.seiyuu = {}, e.searchQuery = "", e.status = "", e.pics = {}, e.vanames = {},
		e.debug = ""
	var p = {},
		h = !1,
		m = 0
	e.seiOut = []
	var f, v = !1
	$("#ld")[0].addEventListener("click", t, !1), $("#msl-logo").on("click",
		function() {
			$("input#name").trigger("change")
		}), $(window).resize(i), n("seiyuu", "GET", void 0, {
		f: {
			name: 1
		}
	}, function(t) {
		$.each(t, function(t, i) {
			e.vanames[i.name.toLowerCase()] = {
				_id: +i._id
			}
		}), e.status = t.length + " records in the database"
	}), $(".toggleTabs").on("click", function() {
		$("#anime,#photos").toggleClass("btn-success btn-default")
	}), $("#anime").on("click", function() {
		$("#roles").show(), $("#pics").hide()
	}), $("#photos").on("click", function() {
		$("#pics").show(), $("#roles").hide(), s()
	}), $("#next").on("click", function() {
		m += 20, s()
	}), $("#prev").on("click", function() {
		m = Math.max(0, m - 20), s()
	}), e.inputChange = function() {
		e.searchQuery.length ? $("#name").attr("list", "vanames") : $("#name").removeAttr(
			"list")
	}, e.disable = function() {
		return e.disabled || Object.keys(e.seiyuu).length >= 4
	}, e.$watchCollection("seiyuu", function() {
		e.searchQuery = "", $("#name").removeAttr("list"), m = 0
		var t = []
		for (n in e.seiyuu) t.push(e.seiyuu[n]), t[t.length - 1].key = n
		e.seiOut = []
		for (var n = 0; n < t.length; n += 2) e.seiOut.push(t.slice(n, n + 2))
		var a = Object.keys(e.seiyuu).length
		return a ? ($("#details").show(), s(), 2 > a ? (e.status =
			"minimum of 2 persons required", e.commonRoles = {}, $("#rolesTable")
			.hide()) : e.updateRoles(), e.$apply(i()), void window.dispatchEvent(
			new Event("resize"))) : void $("#details").hide()
	}), e.$watch("status", function() {
		clearTimeout(f), e.status && $("#spinner").hide()
	}), e.removeVA = function(t) {
		var i = t.target.parentNode.parentNode.id
		p[i] = e.seiyuu[i], delete e.seiyuu[i]
	}, $("input#name").on("change", function(t) {
		e.searchQuery = t.target.value.toLowerCase().trim().replace(
				/\&|\\|\/|\<|\>|\?|\,|\:|\{|\}|\$/gi, ""), e.searchQuery.length > 2 &&
			Object.keys(e.seiyuu).length < 4 ? e.seiyuu[e.searchQuery] || e.seiyuu[
				e.searchQuery.split(" ").reverse().join(" ")] || (p[e.searchQuery] ||
				p[e.searchQuery.split(" ").reverse().join(" ")] ? (p[e.searchQuery.split(
						" ").reverse().join(" ")] && (e.searchQuery = e.searchQuery.split(
						" ").reverse().join(" ")), e.seiyuu[e.searchQuery] = p[e.searchQuery],
					e.$apply()) : e.vanames[e.searchQuery] || e.vanames[e.searchQuery.split(
					" ").reverse().join(" ")] ? r(e.searchQuery) : o("http://" + e.theSite +
					"/people.php", e.searchQuery)) : Object.keys(e.seiyuu).length >= 4 &&
			(e.status = "maximum of 4 persons allowed")
	}), e.parseResults = function(t, i) {
		if (e.status = "not found", 0 === t.query.count) e.status = "n/a"
		else if (t.query.results.tr)
			if (tr = Array.isArray(t.query.results.tr) ? t.query.results.tr : Array(
					t.query.results.tr), "Search Results" == tr[0].td.content) $.each(tr,
				function(t, i) {
					if (0 === t) return !0
					var n = i.td[1].a.content.replace(",", "").trim().toLowerCase()
					return n == e.searchQuery || n == e.searchQuery.split(" ").reverse().join(
						" ") ? (e.status = "", o("http://" + e.theSite + "/" + i.td[0].div.a
						.href), !1) : void 0
				})
			else {
				var n = +t.query.results.a.href.split(e.theSite)[1].match(
						/people\/(\d+)\//)[1],
					s = t.query.results.h1.content.replace(",", "").trim(),
					a = t.query.results.img.src.split(e.theSite)[1],
					r = [],
					l = {}
				$.each(tr, function(t, i) {
					var n = {}
					n.name = i.td[2].a.content.replace(",", ""), n.main = "main" == i.td[
						2].div.content.trim().toLowerCase(), n._id = +i.td[1].a.href.match(
						/anime\/(\d+)\//)[1], r.push(n)
					var s = {}
					s._id = n._id, s.title = i.td[1].a.content, s.pic = i.td[0].div.a.img
						.src.split(e.theSite)[1], s.main = n.main, (!l[s._id] || s.main) &&
						(l[s._id] = s)
				})
				var d = Object.keys(l).length
				e.searchQuery = s.toLowerCase()
				var p = e.vanames[e.searchQuery] && e.vanames[e.searchQuery].hits
				e.seiyuu[e.searchQuery] = {
					_id: n,
					name: s,
					titles: l,
					count: d,
					hits: p || 1
				}, e.status = "found " + d + " title(s)", e.pics[e.searchQuery] ? c(e.searchQuery,
					r, i) : u(e.searchQuery, a, r, i)
			}
	}
	var y
	e.updateRoles = function() {
		var t = {}
		y = {}
		var i, s = Object.keys(e.seiyuu),
			a = s[0],
			r = e.seiyuu[a].count
		$.each(s, function(t, i) {
			e.seiyuu[i].count < r && (r = e.seiyuu[i].count, a = i)
		}), $.each(e.seiyuu[a].titles, function(i, n) {
			var s = !0
			if ($.each(e.seiyuu, function(e, t) {
					return e == a ? !0 : void(t.titles[i] || (s = !1))
				}), s) {
				var r = n
				t[r._id] = n
			}
		}), $.each(t, function(t) {
			i = {}, $.each(e.seiyuu, function(e, n) {
				i[e] = n.titles[t].main
			}), y[t] = i
		})
		var o = Object.keys(t).length
		if (e.status = "found " + o + " common title(s)", e.commonRoles = t, o &&
			$("#rolesTable").show(), $(".table-responsive").css("max-height", Math.max(
				850, $(window).height() - 130)), test = $.grep(Object.keys(t), function(
				e) {
				return !t[e].title
			}), test.length) {
			var u = $.map(e.seiyuu, function(e) {
				return +e._id
			})
			n("anime", "GET", void 0, {
				q: {
					vas: {
						$all: u
					}
				},
				f: {
					title: 1,
					pic: 1
				}
			}, function(t) {
				$.each(t, function(t, i) {
					e.commonRoles[i._id].title = i.title, e.commonRoles[i._id].pic = i
						.pic, $.each(e.seiyuu, function(e, t) {
							t.titles[t.id] && (t.titles[t.id].title = t.title, t.titles[t.id]
								.pic = t.pic)
						})
				})
			})
		}
	}, e.select = function(t) {
		var i = t.target.id || $(t.target).parents('.item').attr('id');
		$.each(e.commonRoles, function(e, t) {
			t.main = y[t._id][i]
		})
	}
}]).config(["$compileProvider", function(e) {
	e.debugInfoEnabled(!1)
}])
