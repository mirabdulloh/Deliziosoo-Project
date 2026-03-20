import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import ReviewMessageModel from "../schema/ReviewMessage";
import NotificationService from "./Notification.service";
import { Types } from "mongoose";
import { getAllowedOrigins } from "../libs/runtime";

interface SocketUser {
  memberId: string;
  socketId: string;
  memberType: "MEMBER" | "ADMIN";
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private notificationService: NotificationService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: getAllowedOrigins(),
        credentials: true,
      },
    });

    this.notificationService = new NotificationService();
    this.initialize();
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      // User joins with their member ID
      socket.on("user:join", (data: { memberId: string; memberType: "MEMBER" | "ADMIN" }) => {
        this.connectedUsers.set(data.memberId, {
          memberId: data.memberId,
          socketId: socket.id,
          memberType: data.memberType,
        });
        
        // Join room for this user
        socket.join(`user:${data.memberId}`);
        console.log(`👤 User joined: ${data.memberId} (${data.memberType})`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        // Find and remove user from connected users
        for (const [memberId, user] of this.connectedUsers.entries()) {
          if (user.socketId === socket.id) {
            this.connectedUsers.delete(memberId);
            console.log(`👋 User disconnected: ${memberId}`);
            break;
          }
        }
      });
    });
  }

  // Notify user about admin reply to their review
  public async notifyAdminReply(memberId: string, reviewId: string, message: string) {
    const room = `user:${memberId}`;
    
    // Save to database
    try {
      await this.notificationService.createNotification({
        memberId: new Types.ObjectId(memberId),
        type: "admin-reply",
        message: `Admin replied to your review: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
        reviewId: new Types.ObjectId(reviewId),
      });
    } catch (err) {
      console.error("Error saving admin reply notification:", err);
    }

    // Emit via socket
    this.io.to(room).emit("review:admin-reply", {
      reviewId,
      message,
      timestamp: new Date(),
    });
    console.log(`📧 Admin reply notification sent to user: ${memberId}`);
  }

  // Notify admin about low rating review
  public async notifyAdminLowRating(reviewData: {
    reviewId: string;
    memberId: string;
    memberNick: string;
    productName: string;
    rating: number;
    comment?: string;
  }) {
    // Send to all connected admins and save to their DB
    for (const [memberId, user] of this.connectedUsers.entries()) {
      if (user.memberType === "ADMIN") {
        // Save to database
        try {
          await this.notificationService.createNotification({
            memberId: new Types.ObjectId(memberId),
            type: "low-rating",
            message: `⚠️ Low rating (${reviewData.rating}⭐) from ${reviewData.memberNick} on ${reviewData.productName}`,
            reviewId: new Types.ObjectId(reviewData.reviewId),
          });
        } catch (err) {
          console.error("Error saving low rating notification:", err);
        }

        // Emit via socket
        this.io.to(user.socketId).emit("review:low-rating", {
          ...reviewData,
          timestamp: new Date(),
        });
      }
    }
    console.log(`⚠️ Low rating notification sent to admins: ${reviewData.rating} stars`);
  }

  // Notify user when admin requests review update
  public async notifyReviewUpdateRequest(memberId: string, reviewId: string) {
    const room = `user:${memberId}`;
    
    // Save to database
    try {
      await this.notificationService.createNotification({
        memberId: new Types.ObjectId(memberId),
        type: "update-requested",
        message: "An admin has requested you to update your review",
        reviewId: new Types.ObjectId(reviewId),
      });
    } catch (err) {
      console.error("Error saving update request notification:", err);
    }

    // Emit via socket
    this.io.to(room).emit("review:update-requested", {
      reviewId,
      message: "An admin has requested you to update your review",
      timestamp: new Date(),
    });
    console.log(`✏️ Update request notification sent to user: ${memberId}`);
  }

  // Get Socket.IO instance for external use
  public getIO() {
    return this.io;
  }
}

let socketServiceInstance: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService(server);
  }
  return socketServiceInstance;
};

export const getSocketService = (): SocketService => {
  if (!socketServiceInstance) {
    throw new Error("Socket service not initialized. Call initializeSocketService first.");
  }
  return socketServiceInstance;
};

export default SocketService;
