const firstName = 'Iqbal';
const lastName = 'Hidayat Rasyad';
const suffix = 'My Portofolio Website';

const BaseData = {
	firstName,
	lastName,
	suffix,
	get fullName() {
		return `${firstName} ${lastName}`;
	}
};

export default BaseData;
