import InvitesService from '../../services/invite.service';
import UserService from '../../services/user.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile, User } from '../../models/user';
import { IInviteModel, ResponseModel, Invite } from '../../models/invite';

export class Controller {

  
  async consume(req:Request, res:Response, next:NextFunction) {
    try {
      var invite = await InvitesService.remove(req.body.code,req.body.fromUser);
      if(invite.expires < new Date())
      {
          var invitingUser = await UserService.findById(invite.fromUser);
          var invitedUser = await UserService.findById(req.user);
          (req.user as UserModel).groupId = invite.fromUser;
          (req.user as UserModel).groupName = invitingUser.fullname;
          await req.user.save();
          res.send(req.user);
      }else
      {
          res.status(500).send("Expired");
      } 
    }catch(error)
    {
        res.status(500).send(error);
    }

  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {

      const inviteData = {
        expires : new Date (new Date().getTime() + (2 * 60 * 60 * 1000)),
        fromUser : req.user,
        code : crypto.getRandomValues(5).toString('hex').substr(0,9),
      } as IInviteModel;

      const invite = await InvitesService.create(inviteData);
      res.send(invite);
    }catch(error) {
        res.status(500).send(error);
    }

  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      (req.user as UserProfile).groupId = "";
      (req.user as UserProfile).groupName = "";
      await (req.user as UserProfile).save();
      res.send(req.user);
    }catch(error)
    {
        res.status(500).send(error);
    }
  }

}

export default new Controller();
