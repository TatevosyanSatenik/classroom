export const loginUser = (user, router) => {	
	try {
		localStorage.setItem('user', JSON.stringify(user));
		console.log('User data stored successfully');
		
		// Verify the data was stored
		const storedUser = localStorage.getItem('user');
		console.log('Verified stored user:', storedUser);
		
		if (storedUser) {
			router.push('/home');
		} else {
			console.error('Failed to store user data');
		}
	} catch (error) {
		console.error('Error during login:', error);
	}
}
