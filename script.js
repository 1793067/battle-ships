
function game(){

//создание общего поля для размещения игровых полей		
		var gameField = document.createElement('div');
        gameField.className = "gamefield";
		gameField.style.width = 100 + 'vh';
		gameField.style.height = 50 + 'vh';
        document.body.appendChild(gameField);
		
		let message = document.createElement('input');
			message.value = "dblclick to place";
			message.style.width = 100 + 'vh';
			message.style.margin = "auto";
			document.body.appendChild(message);

//создание поля игрока		
		let plLib = createField(gameField, "player");
//присвоение ячейкам поля игрока обработчиков событий 'dblclick', запускающих функцию размещения кораблей		
		let playerField = Array.prototype.slice.call(document.querySelectorAll('.player'));
		playerField.forEach(item => item.addEventListener('dblclick', function() {place(plLib)}));

//создание поля компьютера	
		let oppLib = createField(gameField, "opponent");
//размещение кораблей компьютера
		fillField(oppLib);	

//убираем кнопку "start"		
		document.body.removeChild(
			document.querySelector('button[onclick="game()"]')
		);
}
		
	  
      
	function createField(parNode, player) {
		
		let lib = {
				ships: {4: 1, 3: 2, 2: 3, 1: 4}
				  };
//создание доски		
		let elem = document.createElement('div');
        elem.className = "backgrnd";
		elem.style.width = 40 + 'vh';
		elem.style.height = 40 + 'vh';
		elem.setAttribute("size", 10);
        parNode.appendChild(elem);

//размещение полей
        for (let j = 1; j <= 10; j++) {
            for (let i = 1; i <= 10; i++) {
			  let cell = [i, j];
			  lib[cell] = true;
              var div = document.createElement('div');
              div.className = "elements";

              div.style.width = 10 +'%';
              div.style.height = 10 +'%';
              div.setAttribute("x", i);
              div.setAttribute("y", j);
			  
			  if (player == "opponent") {
				  div.setAttribute("onclick", "shoot(this)");
				  div.classList.add("opponent");
			  } else {
				  div.setAttribute("onclick", "put(this)");
				  div.classList.add("player");
				}		  
              elem.appendChild(div);
          }
        }
		return lib;
	};

	
	 function place(lib) {
//размещение кораблей игрока
		 let shipReady = Array.prototype
			.slice.call(document.querySelectorAll('.place_color'));	
		  
		 let cells = shipReady.map(item => [+item.getAttribute("x"), +item.getAttribute("y")])
			.sort(([ax, ay], [bx, by]) => ax-bx || ay-by);


		 let [x0, y0] = cells[0];
		 let [sumX, sumY] = cells.reduce((val, cur) => [val[0] + cur[0] - x0, val[1] + cur[1] - y0], [0, 0]);		 
		 //гениальная формула
		 let validSum = cells.length*(cells.length - 1)/2;
//если корабль нарисован корректно, закращиваем его и уменьшаем счетчик таких кораблей на 1		 
		 if (lib.ships.hasOwnProperty(cells.length) && ((validSum == sumX && sumY == 0) || (validSum == sumY && sumX == 0)) ) { 
			shipReady.forEach(item => {
				item.classList.add('fired');
		 });
			lib.ships[cells.length] -= 1;
		 };
//убираем цвет разметки (желтый) и убираем из библиотеки данный тип, если все корабли данного типа размещены		 
		 shipReady.forEach(item => item.classList.remove('place_color'));
		 if (lib.ships[cells.length] == 0) delete lib.ships[cells.length];
		 
//когда все корабли размещены, с ячеек игрока убираем обработчики нажатий. Убираем поле подсказки "dblclick to place"
		 if (Object.keys(lib.ships).length == 0) {
			 delete lib.ships;			 
			 Array.prototype
			.slice.call(document.querySelectorAll('.player'))
			.forEach(item => {
				item.removeAttribute("dblclick");
				item.removeAttribute("onclick");
			});
			
			let message = document.querySelector("input");
			message.value = "Let's Fight!!!";	 
		 }
	};		
		
		function fillField(lib) {//find freeCell
			const min = 1;
			const max = 10;
			
			while (lib.hasOwnProperty("ships")) {
				for (let key in lib.ships) {
					let rand = [Math.floor(1 + Math.random() * (max + 1 - min)), Math.floor(1 + Math.random() * (max + 1 - min))];
					let dir = Math.floor(Math.random()*2); //genering 1 - horiz or 0 - vert
//создание корабля
					let ship = shipCoord(key, rand, dir);

//если корабль корректный, уменьшаем счетчик таких кораблей и убираем его координаты и соседние координаты из библиотеки поля					
					let validShip = ship.every(item => lib[item]);
					if (validShip) {
						lib.ships[key] -= 1;
						ship.concat(areaCoord(ship)).forEach(item => lib[item] = false);
						ship.forEach(([x, y]) => document.querySelector('div.opponent[x="'+x+'"][y="'+y+'"]').classList.add("activeCell"));
					}
						
//если счетчик таких кораблей равен нулю, удаляем из библиотеки такой тип кораблей						
						if (lib.ships[key] == 0) delete lib.ships[key];			
				}
				
				if (Object.keys(lib.ships).length === 0) delete lib.ships
			};
			
		};
	
			
			function shipCoord(num, randomCoord, direction){
//num - тип корабля. 1 - однопалубный, 2, 3, 4...
//randomCoord - случайная координата 
//direction - направление создания корабля. 0 - по горизонтали, 1 - по вертикали
				let coorArr = [];
				for (let i = 0; i < num; i++) {
//создание координаты по направлению
					coorArr[i] = randomCoord.slice();
					randomCoord[direction]+=1;
				}
				return coorArr;
			}
			
			function areaCoord(shipArr){
//получение массива ячеек вокруг рассматриваемой
//х х х
//х о х
//х х х
				let result = new Set();
				shipArr.forEach(([x, y]) => {
					result.add([x-1, y-1]);
					result.add( [x, y-1] );
					result.add( [x+1, y-1] );
					result.add( [x-1, y] );
					result.add( [x+1, y] );
					result.add( [x-1, y+1] );
					result.add( [x, y+1] );
					result.add( [x+1, y+1] );
				});
//удаление ячеек, вышедших за пределы поля
				result.forEach((item) => {if (item[0]<1 || item[0]> 10 || item[1]<1 || item[1]>10) result.delete(item)} );
				return Array.from(result);
			};
			
		function put(elem) {
//получение координат элемента
			let elemCoord = [+elem.getAttribute("x"), +elem.getAttribute("y")];
//получение массива занятых соседних ячеек
			let wrong = areaCoord([elemCoord]).some(([x,y]) => document.querySelector('div.player[x="'+x+'"][y="'+y+'"]').classList.contains("fired"));
//если массив wrong пустой и сам элемент свободен, предварительно размещаем на нем элемент
			if (!wrong && !elem.classList.contains("fired")) elem.classList.add('place_color');
		}	
		
		
		
		function shoot(elem) {
//стрельба по полю компьютера. По умолчанию корабли компьютера находятся на ячейках с классом "activeCell"
			if (!elem.classList.contains("activeCell")) {
				elem.classList.add("miss");
			} else {	
				elem.classList.add("head");

//если корабль уничтожен, ячейки вокруг него окрашиваются классом "miss"
				let fired = check(elem, "opponent", "activeCell", "head");
				if (fired) {
					areaCoord(fired).forEach(([x, y]) => {
						document.querySelector('div.opponent[x="'+x+'"][y="'+y+'"]').classList.add("miss")
					});
//сам уничтоженный корабль окрашивается	классом	"fired". Прочие классы удаляются			
					fired.forEach(([x, y]) => {
						let firedCell = document.querySelector('div.opponent[x="'+x+'"][y="'+y+'"]');
						firedCell.classList.remove("activeCell", "head", "miss");
						firedCell.classList.add("fired");
					});
				} 
			};
//проверка, на наличие у компьютера кораблей
			if (!document.querySelectorAll(".opponent.activeCell").length){
				alert("you Win!");
				return;
			};
			setTimeout(battle(elem), 2000);
		}	
		
		
		
		function check(cell, player, shipCells, fired) {
//возвращаются координаты уничтоженного корабля или false, если корабль "ранен"
			
//проверка для хода компьютера
			if (!cell) return false;

//оборачивание координаты в массив для корректной обработки функцией "areaCoord"		
			let neigh = [ [+cell.getAttribute("x"), +cell.getAttribute("y")] ];
			let set = new Set();
			set.add(`${neigh}`);

//получение массива координат подбитого корабля	в виде текста		
			while (neigh.length != 0) {
				neigh = areaCoord(neigh)
				.filter(([x, y]) => document.querySelector('div.'+player+'[x="'+x+'"][y="'+y+'"]').classList.contains(shipCells))
				.filter(item => !set.has(""+item));
				
				neigh.forEach(item => set.add(`${item}`));
			}
			
			let regex = /\d+/g;

//перевод текстовых координат в формат массивов
			set = Array.from(set).map(item => [Number(item.match(regex)[0]), Number(item.match(regex)[1])]);

//возвращаются координаты уничтоженного корабля или false, если корабль "ранен"			
			if (set.every(([x,y]) => document.querySelector('div.'+player+'[x="'+x+'"][y="'+y+'"]').classList.contains(fired))) return set;
			return false;
		}
	
	
	
		function battle(elem) {
			
//продолжение хода, если предыдущий выстрел удачный			
			if (elem && (elem.classList.contains("head") || elem.classList.contains("fired")) ) return;

//проверка, остались ли у игрока корабли			
			if (Array.prototype.slice.call(document.querySelectorAll(".player.fired")).every(item => item.classList.contains("miss"))){
				alert("you lose!");
				return;
			};
			
			const min = 1;
			const max = 10;
			
			let lib = new Set;
			
			lib.damaged = Array.prototype.slice.call(document.querySelectorAll('.player.head'));
			
			
			lib.fillShoot = function() {
//закраска заны вокруг убитого корабля игрока				
				lib.damaged.forEach(item => {
					lib.add(""+[+item.getAttribute('x'), +item.getAttribute('y')]);
				});
				let proof = document.querySelector('.player.head');
				let fired = check(proof, "player", "fired", "head");
					
					if (fired) {
					areaCoord(fired).forEach(([x, y]) => {
						let emptyCell = document.querySelector('div.player[x="'+x+'"][y="'+y+'"]');
						emptyCell.classList.add("miss")
					});
		
					fired.forEach(([x, y]) => {
						let firedCell = document.querySelector('div.player[x="'+x+'"][y="'+y+'"]');
						firedCell.classList.remove("head");
						firedCell.classList.add("miss");
					});
				} 
			};
		
			lib.fillmiss = function() {
//добавляем выстрел в библиотеку выстрелов
				Array.prototype
				.slice.call(document.querySelectorAll('.player.miss'))
				.forEach(item => lib.add(""+[+item.getAttribute('x'), +item.getAttribute('y')]));
			};
			
			lib.choice = {
				0 : function() {
//возвращает случайный выстрел компьютера					
						let shoot = [Math.floor(1 + Math.random() * (max + 1 - min)), Math.floor(1 + Math.random() * (max + 1 - min))];
						while(lib.has(""+shoot)) {
							shoot = [Math.floor(1 + Math.random() * (max + 1 - min)), Math.floor(1 + Math.random() * (max + 1 - min))];
						};
						lib.add(""+shoot);
						return shoot;
					},
				1 : function() {
//возвращает выстрел компьютера, если есть 1 повреждение у корабля игрока
						let shoot = [+lib.damaged[0].getAttribute('x'), +lib.damaged[0].getAttribute('y')];
						
						while (lib.has(""+shoot) || shoot[0] < 1 || shoot[0] > 10 || shoot[1] < 1 || shoot[1] > 10) {

//randX и randY принимают значения -1, 0 или 1. 
							let randX = Math.floor(-1 + Math.random() * (3));		
							let randY = randX == 0 ? [-1,1][Math.floor(Math.random() * 2)] : 0;

							shoot[0]=+lib.damaged[0].getAttribute('x') + randX;
							shoot[1]=+lib.damaged[0].getAttribute('y') + randY;

						};
						lib.add(""+shoot);
						return shoot;
					},
				another: function() {
//возвращает выстрел компьютера, если есть несколько повреждений у корабля игрока
					let firedShip = lib.damaged.slice().map(item => [+item.getAttribute('x'), +item.getAttribute('y')])
					let [x0,y0] = firedShip[0];
//определение положения поврежденного корабля: вертикальное/горизонтальное
					let dirVert = firedShip.every((item, _, arr) => item[0] == arr[0][0]);

					
//если сверху или слева от поврежденного корабля уже стреляли, или он находится в верхнем левом краю доски, то стреляем вниз или вправо, если нет, то стреляем вверх или влево
//добавляем выстрел в библиотеку выстрелов 
//возвращаем координаты выстрела [x0, y0]
					if (dirVert) {
						if (y0 == 1 || document.querySelector('div.player[x="'+x0+'"][y="'+(y0-1)+'"]').classList.contains("miss")) {
							y0 = firedShip[firedShip.length - 1][1] + 1;
						} 
						else y0 = y0 - 1;
						
						lib.add(""+[x0, y0]);
						return [x0, y0];
					}; 
					
					if (!dirVert) {
						if (x0 == 1 || document.querySelector('div.player[x="'+(x0-1)+'"][y="'+y0+'"]').classList.contains("miss")) {
							x0 = firedShip[firedShip.length - 1][0] + 1;
						} 
						else x0 = x0 - 1;
							lib.add(""+[x0, y0]);
							return [x0, y0];
					};
				}
			};
			
			
			
			
			
			lib.fillShoot();
			lib.fillmiss();
			
			let shoot;
			let shootCell;

//стрельба компьютера в зависимости от степени повреждения у игрока 			
			if (lib.choice[lib.damaged.length]) {
				shoot = lib.choice[lib.damaged.length]();
			} else shoot = lib.choice.another();

			
				shootCell = document.querySelector('.player[x="'+shoot[0]+'"][y="'+shoot[1]+'"]');
//если компьютер попал в корабль игрока (fired), то он окрашивается в поврежденный цвет (head)				
				if (shootCell.classList.contains("fired")) {
					shootCell.classList.add("head");
				} else shootCell.classList.add("miss");
				lib.add(""+shoot);				
			
			lib.fillShoot();
			
			if (shootCell.classList.contains("fired")) {
				console.log("double shoot opponent!");
				setTimeout(battle, 500);
			};
		}
	  
      
	  
	  
	  