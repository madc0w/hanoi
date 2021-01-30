const playerColors = {
	1: '#db021b',
	2: '#0251db'
};
const numRings = 3;
const numPosts = [2, 1, 2];
const postRadius = 20;
const maxRingRadius = 72;
let canvas, ctx, playerToMove, selectedPost, posts;

function onLoad() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.addEventListener('click', click);

	playerToMove = 1;
	selectedPost = null;
	posts = [];
	let row = 0;
	let id = 0;
	for (const n of numPosts) {
		for (let i = 0; i < n; i++) {
			posts.push({
				id: id++,
				row,
				rings: [],
				x: canvas.width * (i + 0.5) / n,
				y: canvas.height * (row + 0.5) / numPosts.length,
			});
		}
		row++;
	}
	const minRingRadius = postRadius * 1.2;
	const deltaRadius = (maxRingRadius - minRingRadius) / numRings;
	for (let i = 0; i < numRings; i++) {
		posts[0].rings.push({
			player: 1,
			radius: maxRingRadius - (i * deltaRadius)
		});
		posts[posts.length - 1].rings.push({
			player: 2,
			radius: maxRingRadius - (i * deltaRadius)
		});
	}

	paint();
}

function paint() {
	ctx.fillStyle = '#02db92';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	document.getElementById('player-to-move-color').style.backgroundColor = playerColors[playerToMove];

	for (const post of posts) {
		// console.log('post', post);
		if (post == selectedPost) {
			const radius = (post.rings.length > 0 ? post.rings[0].radius : postRadius) + 8;
			ctx.fillStyle = '#eee';
			ctx.beginPath();
			ctx.arc(post.x, post.y, radius, 0, Math.PI * 2);
			ctx.fill();
		}
		for (const ring of post.rings) {
			// console.log('ring', ring);
			ctx.fillStyle = '#222';
			ctx.beginPath();
			ctx.arc(post.x, post.y, ring.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = playerColors[ring.player];
			ctx.beginPath();
			ctx.arc(post.x, post.y, ring.radius - 3, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.fillStyle = '#b59d36'; // brown
		ctx.beginPath();
		ctx.arc(post.x, post.y, postRadius, 0, Math.PI * 2);
		ctx.fill();
	}
}

function click(event) {
	if (getWinPlayer()) {
		return;
	}
	// console.log(event);
	const x = event.x - canvas.getBoundingClientRect().x;
	const y = event.y - canvas.getBoundingClientRect().y;
	// console.log(x, y);

	// selectedPost = null;
	let clickedPost = null;
	for (const post of posts) {
		if (selectedPost || post.rings.length == 0 || post.rings[post.rings.length - 1].player == playerToMove) {
			// const radius = post.rings.length == 0 ? postRadius : post.rings[0].radius;
			const dist = Math.sqrt((post.x - x) * (post.x - x) + (post.y - y) * (post.y - y));
			// console.log('radius', radius);
			// console.log('dist', dist);
			if (dist < maxRingRadius) {
				clickedPost = post;
				break;
			}
		}
	}
	// console.log('clickedPost', clickedPost);
	if (clickedPost) {
		if ((!selectedPost && clickedPost.rings.length == 0) || (selectedPost && clickedPost.rings.length > 0 && clickedPost.rings[0].player != playerToMove)) {
			return;
		}
		if (selectedPost && (clickedPost.rings.length == 0 || clickedPost.rings[clickedPost.rings.length - 1].radius > selectedPost.rings[selectedPost.rings.length - 1].radius)) {
			const ring = selectedPost.rings.pop();
			if (!ring) {
				console.error(selectedPost);
			}
			clickedPost.rings.push(ring);
			selectedPost = null;
			const winPlayer = getWinPlayer();
			if (winPlayer) {
				const winnerDiv = document.getElementById('winner');
				winnerDiv.style.backgroundColor = playerColors[winPlayer];
				winnerDiv.innerHTML = `<div id="win-player">WINNER!</div><div>Click to Play Again</div>`;
				winnerDiv.style.visibility = 'visible';
			} else {
				playerToMove = playerToMove == 1 ? 2 : 1;
			}
		} else if (!selectedPost) {
			selectedPost = clickedPost;
		}
	} else {
		selectedPost = null;
	}
	paint();
}

function getWinPlayer() {
	let winPlayer = null;
	for (const post of posts) {
		if (post.rings.length == numRings) {
			if (post.row == 0) {
				let isWin = true;
				for (const ring of post.rings) {
					if (ring.player != 2) {
						isWin = false;
						break;
					}
				}
				if (isWin) {
					winPlayer = 2;
					break;
				}
			} else if (post.row == numPosts.length - 1) {
				let isWin = true;
				for (const ring of post.rings) {
					if (ring.player != 1) {
						isWin = false;
						break;
					}
				}
				if (isWin) {
					winPlayer = 1;
					break;
				}
			}
		}
	}
	return winPlayer;
}

function reset() {
	const winnerDiv = document.getElementById('winner');
	winnerDiv.style.visibility = 'hidden';
	onLoad();
}
