import { updateUserPassword,findUserById } from "../../core/models/user.model.js";
import bcrypt from "bcrypt";


export async function getProfile(req, res) {
    try {
        const userId = req.user.userId;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "Profile fetched",
            user: {
                id: user.id,
                full_name: user.full_name,
                last_name: user.last_name,
                email: user.email,
                phoneno: user.phoneno,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function updatePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Both current and new passwords are required",
            });
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(
            currentPassword,
            user.password,
        );
        if (!validPassword) {
            return res
                .status(401)
                .json({ message: "Incorrect current password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await updateUserPassword(userId, hashedNewPassword);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
