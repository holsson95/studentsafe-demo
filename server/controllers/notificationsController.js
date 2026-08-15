const notificationModel = require('../models/notificationsModel');
const userModel = require('../models/userModel');

// const createNotif = async (req, res) => {
//     const receiver_id = req.user.id;
//     const { access_level, target_receiver_id, school_id, building_id, message} = req.user;

//     try{
//         if(!message) {
//             return res.status(400).json({ error: "Message is required"});
//         }
//         let recipients = [];

//         if(target_receiver_id){
//         recipients = wait userModel.getUserById(target_receiver_id);
//         if(!recipients){
//             return res.status(404).json({ error: "target user not found"});
//         }
//         recipients = [recipients];
//     }
//     else if(building_id){
//         recipients = await userModel.getusersByBuilding(building_id);
//     }
//     else if(school_id){
//         recipients = await userModel.getUsersBySchool(school_id);
//     }
//     else {
//         recipients = [req.user];
//     }

//     let createdNotif = [];

//     for (const recipient of recipients) {
//         const notif = await notificationModel.createNotif({
//             receiver_id: recipient.id,
//             message,
//             created_by_id: user.id
//         });
//         created.push(notif);
//     }
//     res.status(201).json({
//         message: "Notifications created",
//         count: created.length,
//         notifications: created
//     });
//     } catch (err) {
//         console.error('Failed to create notification:', err);
//         res.status(500).json({error: 'Failed to create notifications'});
//     }
// };

const notifyCaseSubmitted = async({ submitted_by, school_id, message, case_id }) => {
    const senderId = submitted_by.id;
    const access_level = submitted_by.access_level;

    let recipients = [];
    try{
    if(access_level === 1) {
        const [level2, level3] = await Promise.all([
            userModel.getUsersBySchoolAndLevel(school_id, 2),
            userModel.getUsersByLevel(3)
        ]);
        recipients = [...level2, ...level3];
    } else if(access_level === 2) {
       recipients = await userModel.getUsersByLevel(3);
    }
    for(const recipient of recipients) {
        await notificationModel.createNotif({
            receiver_id: recipient.id,
            message,
            created_by_id: senderId,
            case_id
        });
    }
} catch (err) {
        console.error('Failed to create notifications:', err);
    }
};

const notifyCaseShared = async({ shared_by, school_id, case_share_id, message, case_id, shared_with_user_ids}) => {
    const senderId = shared_by.id;
    
    let recipients = [];
    try{
        recipients = await userModel.getUsersByIds(shared_with_user_ids);

        for (const recipient of recipients) {
            const notif = await notificationModel.createNotif({
                receiver_id: recipient.id,
                message,
                created_by_id: senderId,
                case_id,
                case_share_id: case_share_id
            });
            console.log(`Notification created for user: ${recipient.id}`);
        }
    } catch(err) {
        console.error('Failed to create notifications:', err);
    }
};

const getUserNotif = async (req, res) => {
    const receiver_id = req.user.id;

    try{
        const notification = await notificationModel.getUserNotif(receiver_id);
        const notificationsWithSenderInfo = notification.map(notif => {
            if(notif.type === 'reminder') {
                return {
                    ...notif,
                    submitted_by_name: 'SYSTEM',
                    submitted_by_role: '',
                };
            }
            return {
                ...notif,
                submitted_by_name: notif.submitted_by_name || (notif.type === 'reminder' ? 'REMINDER' : 'SYSTEM'),
                submitted_by_role: notif.submitted_by_role || (notif.role === 'reminder' ? 'SYSTEM' : ''),
            };
    });
        res.json(notificationsWithSenderInfo);
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        res.status(500).json({ errror: 'Failed to fetch notifications'});
    }
};

const getNotifById = async(req, res) => {
    const { id } = req.params;
    const receiver_id = req.user.id;

    try{
        const notification = await notificationModel.getNotifById(id, receiver_id);
        if(!notification){
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch notification', err});
    }
};

const deleteNotif = async(req, res) => {
    const { id } = req.params;
    const receiver_id = req.user.id;

    try{
        const deleted = await notificationModel.deleteNotif(id, receiver_id);
        if(!deleted){
            return res.status(404).json({ message: 'Notification not found'});
        }
        res.json({message: 'Notification deleted successfully' });
    }catch (err) {
        res.status(500).json({error: 'Failed to delete notification',});
    }
};

const deleteAllReadNotif = async(req, res) => {
    const receiver_id = req.user.id;
    
    try{
        await notificationModel.deleteAllReadNotif(receiver_id);
            res.json({message: 'All notifications has been deleted'});
     } catch (err) {
            console.error('Error deleting all notifications:', err);
            res.status(500).json({error: 'Failed to delete notifications'});
    }
};

const markAsRead = async(req, res) => {
    const { id } = req.params;
    try{
        const updated = await notificationModel.markAsRead(id);
        if(!updated) {
            return res.status(404).json({ message: 'Notification not found'});
        }
        res.json({ message: 'Notification marked as read', notification: updated});
    } catch (err) {
        console.error('Failed to mark notification as read', err);
        res.status(500).json({ error: 'Failed to mark notification as read'});
    }
};

const markAllAsRead = async(req, res) => {
    const receiver_id = req.user.id;
    console.log('Marking all notifications as read for user:', receiver_id);

    try{
        await notificationModel.markAllAsRead(receiver_id);
        res.json({ message: 'All notifications marked as read'});
    }catch(err) {
        console.error('Failed to mark all notification as read', err);
        res.status(500).json({ error: 'Failed to mark all notification as read'});
    }
}

module.exports = {
    notifyCaseSubmitted,
    notifyCaseShared,
    getUserNotif,
    deleteNotif,
    deleteAllReadNotif,
    getNotifById,
    markAllAsRead,
    markAsRead
};