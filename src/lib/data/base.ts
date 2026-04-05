const firstName = 'Iqbal';
const lastName = 'Hidayat Rasyad';
const suffix = 'Software Engineer';

const BaseData = {
	firstName,
	lastName,
	suffix,
	get fullName() {
		return `${firstName} ${lastName}`;
	}
};

export default BaseData;
