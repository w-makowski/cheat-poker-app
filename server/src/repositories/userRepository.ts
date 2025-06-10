import Player from '../models/Player';
import User from '../models/User';


export async function getUserProfile(auth0Id: string) {
    const user = await User.findOne({ where: { auth0Id } });
    if (!user) {
        throw new Error('User not found');
    } else {
        const [gamesPlayed, gamesWon] = await Promise.all([
            Player.count({ where: { userId: user.id } }),
            Player.count({ where: { userId: user.id, standing: 1 } })
        ]);
        return { id: user.id, username: user.username, email: user.email, gamesPlayed, gamesWon };
    }
}

export async function getAllUsers() {
    return User.findAll();
}

export async function banUserById(userId: string | number) {
    console.log(`banning user ${userId}`);
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.accountStatus = 'banned';
    await user.save();
    return user;
}

// server/src/repositories/userRepository.ts
export async function unbanUserById(userId: string | number) {
    console.log(`unbanning user ${userId}`);
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.accountStatus = 'active';
    await user.save();
    return user;
}
