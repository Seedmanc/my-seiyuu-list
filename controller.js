/* global angular, $ */
angular.module('myApp', [])
	.config(['$interpolateProvider', function ($interpolateProvider) {
		$interpolateProvider.startSymbol('[[');
		$interpolateProvider.endSymbol(']]');
	}
	])
	.filter('object2Array', function () {
		return function (input) {
			var outs = [];
			for (var i in input) {
				outs.push(input[i]);
			}
			return outs;
		};
	})
	.controller('myCtrl', function ($scope) {
		$scope.orderByField = ['-main', '+title'];
		$scope.orderByFieldR = '-hits';
		$scope.reverseSort = false;
		$scope.theSite = '\x6d\x79\x61\x6e\x69\x6d\x65\x6c\x69\x73\x74\x2e\x6e\x65\x74';
		$scope.commonRoles = {};
		$scope.seiyuu = {};
		$scope.searchQuery = '';
		$scope.status = '';
		$scope.vanames = {};
		$scope.debug = '';
		$scope.seiOut = [];
		$scope.mainOnly = localStorage.mainOnly == "true";
		$scope.selectedSeiyuu = '';
		$scope.tiers = {};
		$scope.rankedSeiyuu = [];

		var failCount = 0;

		var recycle = {};
		//var over = false;
		var pid = 0;
		var to;
		var disqusLoaded = false;

		$('#ld')[0].addEventListener('click', loadDisqus, false);
		$('#msl-logo').on('click', function () {
			$('input#name').trigger('change');
		});

		function loadDisqus() {
			$('#disqus_thread').toggle();

            if (disqusLoaded) return;

			$.ajax({
				type:     "GET",
				url:      "//seedmanc.disqus.com/embed.js",
				dataType: "script",
				cache:    true
			}).done(function () {
				disqusLoaded = true;
			});
		}

		function mobileSize() {
			if ($(window).width() < 768) {
				$('.well').addClass('under768');
				$('table.text-center').addClass('under768');
				$('#rolesTable').addClass('table-condensed');
			} else {
				$('.well').removeClass('under768');
				$('table.text-center').removeClass('under768');
				$('#rolesTable').removeClass('table-condensed');
			}
		}

		$(window).resize(mobileSize);

		function mongoCall(coll, mode, data, ops, callback) {
			var path = "collections/" + coll;
			var options = '', arg;

			if (mode == "runCommand") {
				path = mode;
				mode = "POST";
			}

			ops = ops || [];
			$.each(ops, function (i, v) {
				options += '&' + '%' + i.charCodeAt(0).toString(16) + '=' + encodeURIComponent(JSON.stringify(v));
			});

			if (coll && ~mode.indexOf('T')) {
				arg = '%66%59%6a%45%4a%6f%4d%35%61%52%69%4a%6e%72%4c%4b';
			}

			$('#spinner').show();
			to = setTimeout(function () {
				$('#spinner').hide();
			}, 10000);

			$.ajax({
				url:         "https://api.mongolab.com/api/1/databases/myseiyuulist/" + path + "\x3f%61%70\x69%4b%65%79\x3d%52%34\x6a\x67%38\x71%71%68\x70%54%49%36\x38%6c\x52%59" + arg + (options),
				data:        JSON.stringify(data),
				type:        mode,
				contentType: "application/json"
			}).done(function (result) {

				if (result.error) {
					$scope.debug += '\n\r' + JSON.stringify(result.error || '');
				}

				(callback || angular.noop)(result);
				
			}).fail(function (error) {
				$scope.debug += '\n\r' + JSON.stringify(error) + ' Error accessing database.';

				if (failCount <= 2) {

					failCount++;
					
					mongoCall(
						'errors',
						'POST',
						{
							date: new Date(),

							source: 'mongoCall',
							args:   {coll: coll, mode: mode, data: data, ops: ops},

							browser: navigator.userAgent,

							error:   error,
							comment: 'ajax call fail ' + failCount
						}
					);
				} 
			}).always(function () {
				$scope.$apply();
				$('#spinner').hide();
			});
		}

		mongoCall(
			'seiyuu',
			'GET',
			undefined,
			{f: {"name": 1}},
			function (result) {
				$.each(result, function (i, v) {
					$scope.vanames[v.name.toLowerCase()] = {_id: Number(v._id)};
				});
				$scope.status = result.length + ' records cached';
			}
		);

		$('.toggleTabs').on('click', function () {
			$('#anime,#photos').toggleClass('btn-success btn-default');
		});

		$('#anime').on('click', function () {
			$('#roles').show();
			$('#pics').hide();
		});
		$('#photos').on('click', function () {
			$('#pics').show();
			$('#roles').hide();
			updatePics();
		});

		function updatePics() {
			var cntr = 0, tags;

			if (!$('#pics').is(":visible")) {
				$('span.thumb').remove();
				return;
			}

			tags = $.map($scope.seiyuu, function (v, i) {
				cntr++;
				return i.replace(/ou\s|ou$/i, 'o ').trim().replace(/uu/gi, 'u').replace(/\s+/g, '_');
			}).join('+');

			if (!cntr) {
				$('#nav').hide();
				return;
			} else {
				$('#nav').show();
				if (cntr == 1) {
					tags += '+solo';
				}
			}
			if (pid > 0) {
				$('#prev').show();
			} else {
				$('#prev').hide();
			}
			$('#thumbContainer').load('https://crossorigin.me/http://koe.booru.org/index.php?page=post&s=list&tags=' + tags + '&pid=' + pid + ' div.content span.thumb',
				function (response, status, xhr) {
					gotPics(tags, status, xhr);
				}
			);
		}

		function gotPics(tags, status, xhr) {
			var thumbs = $('span.thumb'), moreTags;

			if (status == 'error') {
				$scope.debug += '\n\r' + xhr.status + " " + xhr.statusText +
					' Pictures could not be retrieved now. You can see them here: ';
				$scope.$apply();
				$('#debug').append('<a href="http://koe.booru.org/index.php?page=post&s=list&tags=' + tags + '" target="_blank">Koebooru</a>');

				return;
			}

			thumbs.addClass("img-thumbnail");
			thumbs.find('a').each(function (i, v) {
				v.href = $(v).find('img').attr('src').replace('thumbs', 'img').replace('thumbnails', 'images').replace('thumbnail_', '');
				v.target = "_blank";
			});
			if (thumbs.length == 0 && ~tags.indexOf('solo')) {
				$('#thumbContainer').load('https://crossorigin.me/http://koe.booru.org/index.php?page=post&s=list&tags=' + tags.replace('+solo', '') + '&pid=' + pid + ' div.content span.thumb', function (response, status, xhr) {
					gotPics(tags.replace('+solo', ''), status, xhr);
				});

				return;
			}
			if (thumbs.length < 20) {
				moreTags = '~' + tags.replace('+solo', '').replace(/\+/g, '+~');
				$('#next').hide();
				thumbs.last().after('<span class="thumb">more at  <b><a href="http://koe.booru.org/index.php?page=post&s=list&tags=' + moreTags + '">koe.booru.org</a></b></span>');
			} else {
				$('#next').show();
			}
		}

		$('#next').on('click', function () {
			pid += 20;
			updatePics();
		});

		$('#prev').on('click', function () {
			pid = Math.max(0, pid - 20);
			updatePics();
		});

		$scope.inputChange = function () {
			if ($scope.searchQuery.length) {
				$('#name').attr('list', "vanames");
			} else {
				$('#name').removeAttr('list');
			}
		};

		$scope.disable = function () {
			return $scope.disabled || (Object.keys($scope.seiyuu).length >= 4);
		};

		$scope.$watch("mainOnly", function () {
			localStorage.mainOnly = $scope.mainOnly;
			$scope.updateRoles();
		});

		$scope.$watchCollection("seiyuu", function () {
			var outs = [], count;

			$scope.searchQuery = '';
			$('#name').removeAttr('list');
			pid = 0;
			for (var i in $scope.seiyuu) {
				outs.push($scope.seiyuu[i]);
				outs[outs.length - 1].key = i;
			}
			$scope.selectedSeiyuu = i;
			$scope.seiOut = [];

			for (i = 0; i < outs.length; i += 2) {
				$scope.seiOut.push(outs.slice(i, i + 2));
			}

			count = Object.keys($scope.seiyuu).length;
			if (!count) {
				$('#details').hide();
				return;
			}
			else {
				$('#details').show();
				updatePics();
			}
			if (count < 2) {
				$scope.status = 'minimum of 2 persons required';
				$scope.commonRoles = {};
				$('#rolesTable').hide();
			}
			else {
				$scope.updateRoles();
			}

			setTimeout(function () {
				$scope.$apply(mobileSize);
				if (window.dispatchEvent) window.dispatchEvent(new Event('resize'));
			}, 0);
		});

		$scope.$watch('status', function () {
				clearTimeout(to);
				if ($scope.status) {
					$('#spinner').hide();
				}
			}
		);

		$scope.removeVA = function (that) {
			var name = that.target.parentNode.parentNode.id;

			recycle[name] = $scope.seiyuu[name];
			delete $scope.seiyuu[name];
		};

		$('input#name').on('change', function (that) {
			try {
				$scope.searchQuery = that.target.value.toLowerCase().trim().replace(/&|\\|\/|<|>|\?|\,|\:|\{|\}|\$/gi, '').replace(/\s+/g, ' ');
				//todo encodeURI?
				if (($scope.searchQuery.length > 2) && (Object.keys($scope.seiyuu).length < 4)) {

					if ((!$scope.seiyuu[$scope.searchQuery]) && (!$scope.seiyuu[$scope.searchQuery.split(/\s+/).reverse().join(' ')])) {

						if ((!recycle[$scope.searchQuery]) && (!recycle[$scope.searchQuery.split(/\s+/).reverse().join(' ')])) {
							if (!$scope.vanames[$scope.searchQuery] && !$scope.vanames[$scope.searchQuery.split(/\s+/).reverse().join(' ')]) {
								fetchSearch('http://' + $scope.theSite + '/people.php', $scope.searchQuery);
							} else {
								db2seiyuu($scope.searchQuery);
							}
						} else {
							if (recycle[$scope.searchQuery.split(/\s+/).reverse().join(' ')]) {
								$scope.searchQuery = $scope.searchQuery.split(/\s+/).reverse().join(' ');
							}
							$scope.seiyuu[$scope.searchQuery] = recycle[$scope.searchQuery];
							$scope.$apply();
						}
					}
				} else if (Object.keys($scope.seiyuu).length >= 4) {
					$scope.status = "maximum of 4 persons allowed";
				}
			} catch (e) {
				$scope.debug = 'Error parsing the input value.';

				mongoCall(
					'errors',
					'POST',
					{
						date:     new Date(),

						source:  'name change',
						args:     {searchQuery: $scope.searchQuery, value: that.target.value},

						browser:  navigator.userAgent,

						error:    e.name + ' ' + e.message,
						comment:  e.lineNumber
					}
				);
			}
		});

		function db2seiyuu(name) {
			var _id = ($scope.vanames[name] || $scope.vanames[name.split(/\s+/).reverse().join(' ')])._id;

			mongoCall("anime",
				"GET",
				undefined,
				{
					q: {
						"vas": _id
					},
					c: true
				},
				function (response) {
					if (Number(response) > 0) {
						loadFromDB(_id);
					}
					else {
						fetchSearch('http://' + $scope.theSite + '/people/' + _id, '', true);
					}
				}
			);
		}

		function loadFromDB(_id) {
			mongoCall(
				'seiyuu',
				'runCommand',
				{
					findAndModify: "seiyuu",
					query:         {_id: _id},
					update:        {
										$inc: {hits: 1},
										$set: {accessed: Number(new Date())}
									},
					'new':         true
				},
				{},
				function (result) {
					var updated = Date.parse(result.value.updated) / 1000;
					var now = Date.parse(new Date().toUTCString()) / 1000;

					$scope.searchQuery = result.value.name.toLowerCase();
					if ((Math.abs(now - updated) > 2592000) && false) {	//30 days, disabled
						fetchSearch('http://' + $scope.theSite + '/people/' + result.value._id, '', true);
						return;
					}

					result.value.titles = {};
					$.each(result.value.roles, function (i, v) {
						if (!result.value.titles[v._id] || v.main) {
							result.value.titles[v._id] = {_id: v._id, main: v.main};
						}
					});
					delete result.value.roles;
					$scope.seiyuu[result.value.name.toLowerCase()] = result.value;
				}
			);
		}

		function fetchSearch(url, name, overwrite) {
			$('#spinner').show();
			to = setTimeout(function () {
				$('#spinner').hide();
			}, 10000);

			if (name) {
				url = url + '?q=' + encodeURI(name);
			}
			$.ajax({
				url:      'https://query.yahooapis.com/v1/public/yql',
				data:     {
					q:	"SELECT * FROM html WHERE url = '" + url + "' AND xpath IN (" +
						"'//div[@id = \"contentWrapper\"]//h1[1]'," +
						"'//div[@id = \"content\"]//form[@name = \"searchVA\"]/following::table[1]//tr'," +
						"'//div[@id = \"content\"]/table/tbody/tr/td[2]/div[@class = \"normal_header\"][1]/following-sibling::*[1]//tr'," +
						"'//div[@id = \"content\"]/table/tbody/tr/td[1]/div[1]/a/img'," +
						"'//div[@id = \"content\"]/table/tbody/tr/td[2]/div[2]/div[3]/a'" +
					")",
					format: "json"
				},
				dataType: "json",
				type:     'GET'
			}).done(function (result) {
					$scope.parseResults(result, overwrite);

					if (result.query.count == 0) {
						mongoCall(
							'errors',
							'POST',
							{
								date:     new Date(),

								source:  'fetchSearch',
								args:     {url: url.split($scope.theSite)[1], name: name, overwrite: overwrite},

								browser:  navigator.userAgent,

								error: result,

								comment: 'done fail'
							}
						);
					}
				})
				.fail(function (response) {
					$scope.debug = JSON.stringify(response) + ' Error searching for ' + name;

					mongoCall(
						'errors',
						'POST',
						{
							date:     new Date(),

							source:  'fetchSearch',
							args:     {url: url, name: name, overwrite: overwrite},

							browser:  navigator.userAgent,

							error: response,

							comment: 'ajax call fail'
						}
					);
				})
				.always(function () {
					$scope.disabled = false;
					$scope.$apply();
				});

			$scope.disabled = true;
			$scope.$apply();
		}

		$scope.parseResults = function (res, overwrite) {
			try {
				$scope.status = "not found";
				if (res.query.count === 0) {
					$scope.status = "n/a";

				} else if (res.query.results.tr) {
					var tr = Array.isArray(res.query.results.tr) ? res.query.results.tr : new Array(res.query.results.tr);

					if (tr[0].td.content == "Search Results") {
						$.each(tr, function (i, v) {
							if (i === 0) return true;

							var foundName = v.td[1].a.content.replace(',', '').trim().toLowerCase();

							if ((foundName == $scope.searchQuery) || (foundName == $scope.searchQuery.split(/\s+/).reverse().join(' '))) {
								$scope.status = '';
								fetchSearch('http://' + $scope.theSite + '/' + v.td[0].div.a.href);

								return false;
							}
						});
					} else { //found
						var va_id = Number(res.query.results.a.href.split($scope.theSite)[1].match(/people\/(\d+)\//)[1]);
						var name = res.query.results.h1.content.replace(',', '').trim();
						var pic = res.query.results.img.src.split($scope.theSite)[1];
						var roles = [], titles = {};
						var count, hits;

						$.each(tr, function (i, v) {
							var character = {}, entry = {};

							character.name = v.td[2].a.content.replace(',', '');
							character.main = v.td[2].div.content.trim().toLowerCase() == "main";
							character._id = Number(v.td[1].a.href.match(/anime\/(\d+)\//)[1]);
							roles.push(character);

							entry._id = character._id;
							entry.title = v.td[1].a.content;
							entry.pic = (v.td[0].div.a.img.src || v.td[0].div.a.img['data-src']).split($scope.theSite)[1];
							entry.main = character.main;

							if (!titles[entry._id] || entry.main) {
								titles[entry._id] = entry;
							}
						});

						count = Object.keys(titles).length;
						$scope.searchQuery = name.toLowerCase();
						hits = $scope.vanames[$scope.searchQuery] && $scope.vanames[$scope.searchQuery].hits;
						$scope.seiyuu[$scope.searchQuery] = {
							'_id':  va_id,
							name:   name,
							pic:    pic,
							titles: titles,
							count:  count,
							hits:   hits || 1
						};
						$scope.status = 'found ' + count + ' title(s)';
						seiyuu2db($scope.searchQuery, roles, overwrite);
					}
				}
			} catch (e) {
				$scope.debug = 'Error parsing the server response. Use comments section if you want to report it.';

				mongoCall(
					'errors',
					'POST',
					{
						date:     new Date(),

						source:  'parseResults',
						args:     {url: res, overwrite: overwrite},

						browser:  navigator.userAgent,

						error:    e.name + ' ' + e.message,
						comment:  e.lineNumber
					}
				);
			}
		};

		function seiyuu2db(name, roles, overwrite) {
			var toSave;

			if ($scope.vanames[name] && !overwrite) {
				mongoCall(
					'seiyuu',
					'PUT',
					{$inc: {hits: 1}},
					{q: {"_id": $scope.vanames[name]._id}}
				);
			} else {
				toSave = $scope.seiyuu[name];
				mongoCall(
					'seiyuu',
					'POST',
					{
						_id:     toSave._id,
						name:    toSave.name,
						pic:     toSave.pic,
						count:   toSave.count,
						hits:    1,
						roles:   roles,
						updated: new Date().toUTCString(),
						accessed: Number(new Date())
					},
					function (result) {
						$scope.vanames[result.name.toLowerCase()] = {_id: result._id, hits: result.hits};
					}
				);
				anime2db(name);
			}
		}

		function anime2db(name) {
			var currentA = $.map($scope.seiyuu[name].titles, function (v, i) {
				return Number(i);
			});

			mongoCall(
				'anime',
				'GET',
				undefined,
				{
					q: {'_id': {'$in': currentA}},
					f: {'_id': 1}
				},
				function (result) {
					var dbCur = $.map(result, function (v) {
							return Number(v._id);
						}) || [];

					gotTitles(dbCur, currentA, name);
				}
			);
		}

		function gotTitles(dbCur, currentA, name) {
			var cur_db = $(currentA).not(dbCur).get() || [];

			if (dbCur.length) {
				dbCur = $.map(dbCur, function (v) {
					return Number(v);
				});
				mongoCall(
					'anime',
					'PUT',
					{'$addToSet': {'vas': $scope.seiyuu[name]._id}},
					{
						q: {"_id": {"$in": dbCur}},
						m: true
					}
				);
			}
			if (cur_db.length) {
				var newRecords = [];
				var vas;

				$.each(cur_db, function (i, v) {
					var toSave = $scope.seiyuu[name].titles[v];

					vas = [];
					vas[0] = Number($scope.seiyuu[name]._id);
					newRecords.push({_id: toSave._id, title: toSave.title, pic: toSave.pic, vas: vas});
				});
				mongoCall(
					'anime',
					'POST',
					newRecords
				);
			}
		}

		$scope.updateRoles = function () {
			try {
				var out = {}, len;
				var keys = Object.keys($scope.seiyuu);
				var selected = keys[0];
				var min;

				if (!keys.length) return;

				min = $scope.seiyuu[selected].count;

				$.each(keys, function (i, v) {
					if ($scope.seiyuu[v].count < min) {
						min = $scope.seiyuu[v].count;
						selected = v;
					}
				});

				$.each($scope.seiyuu[selected].titles, function (_id, title) {
					var common = true;

					$.each($scope.seiyuu, function (name, person) {
						if (name == selected) return true;

						if (!person.titles[_id]) {
							common = false;
						}
					});
					if (common) {
						out[title._id] = $.extend({}, title);
					}
				});

				$.each(out, function (i, v) {
					var tier = {};

					$.each($scope.seiyuu, function (name, person) {
						tier[name] = person.titles[i].main;
						v.title = v.title || person.titles[i].title;
						v.pic = v.pic || person.titles[i].pic;
					});

					$scope.tiers[i] = tier;
					v.title = v.title || i;
				});

				len = Object.keys(out).length;
				$scope.status = 'found ' + len + ' common title(s)';

				if ($scope.mainOnly) {
					$scope.commonRoles = {};
					$.each(Object.keys(out), function (i, v) {
						var isMain = true;

						$.each($scope.tiers[out[v]._id], function (ix, vl) {
							return isMain = vl;
						});
						if (isMain) {
							$scope.commonRoles[v] = out[v];
						}
					});
				} else {
					$scope.commonRoles = out;
				}

				if (len) {
					$('#rolesTable').show();
				}

				$('.table-responsive').css('max-height', Math.max(850, $(window).height() - 130));

				var test = $.grep(Object.keys(out), function (v) {
					return !out[v].pic;
				});
				if (!test.length) return;

				var s_ids = $.map($scope.seiyuu, function (v) {
					return Number(v._id);
				});

				mongoCall(
					'anime',
					'GET',
					undefined,
					{
						q: {vas: {$all: s_ids}},
						f: {"title": 1, "pic": 1}
					},
					function (result) {
						$.each(result, function (i, v) {
							if ($scope.commonRoles[v._id]) {
								$scope.commonRoles[v._id].title = v.title;
								$scope.commonRoles[v._id].pic = v.pic;

								$.each($scope.seiyuu, function (name, person) {
									person.titles[v._id].pic = v.pic;
									person.titles[v._id].title = v.title;
								});
							}
						});
					}
				);

			} catch (e) {
				$scope.debug = 'Error updating roles, use comments to report it.';

				mongoCall(
					'errors',
					'POST',
					{
						date:     new Date(),

						source:  'updateRoles',
						args:     {keys: keys},

						browser:  navigator.userAgent,

						error:    e.name + ' ' + e.message,
						comment:  e.lineNumber
					}
				);
			}
		};

		$scope.select = function (that) {
			if ($scope.mainOnly) return;

			$scope.selectedSeiyuu = that.target.id || $(that.target).parents('.item').attr('id');

			$.each($scope.commonRoles, function (i, v) {
				v.main = $scope.seiyuu[$scope.selectedSeiyuu].titles[i].main;
			});
		};

		$scope.showRanking = function () {
			$('.ranking-curtain').show();
			$('#ranking-spinner').show();

			$scope.rankedSeiyuu = [];

			mongoCall(
				'seiyuu',
				'GET',
				undefined,
				{f: {"name": 1, "hits":1, "updated": 1, "accessed": 1}},
				function (result) {
					$.each(result, function (i, v) {
						var accessed = new Date(v.accessed || v.updated);


						$scope.rankedSeiyuu.push(
							{
								_id: v._id,
								name: v.name,
								hits: v.hits,
								accessedText: accessed.toLocaleDateString(),
								accessed: Number(accessed)
							}
						);
					});

					$('#ranking tbody').show();
					$('#ranking-spinner').hide();
				}
			);
		}

	}).config(['$compileProvider', function ($compileProvider) {
		$compileProvider.debugInfoEnabled(false);
	}
]);
//todo show all roles for single seiyuu
//todo nglist with looping over several names?
//todo ngPluralize?
//todo manual updating
