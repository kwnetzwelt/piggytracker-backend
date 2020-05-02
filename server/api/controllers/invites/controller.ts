import InvitesService from '../../services/invite.service';
import UserService from '../../services/user.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile, User } from '../../models/user';
import { IInviteModel, ResponseModel, Invite } from '../../models/invite';
import crypto from 'crypto';

export class Controller {

  
  async consume(req:Request, res:Response, next:NextFunction) {
    try {
      const invite = await InvitesService.remove(req.body.code);
      if(new Date(invite.expires) > new Date())
      {
        if(invite.fromUser === (req.user as UserProfile).id)
        {
          res.status(409).send({message:"You cannot consume your own invite. "});
        }else
        {
          var invitedUser = await UserService.setUserGroup((req.user as UserProfile).id, invite.fromUser);
          res.send(invitedUser);
        }
      }else
      {
          res.status(500).send({message:"Expired"});
      } 
    }catch(error)
    {
        res.status(error.status).send(error);
    }

  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {

      const inviteData = {
        expires : new Date (new Date().getTime() + (2 * 60 * 60 * 1000)),
        fromUser : (req.user as UserProfile).id,
        code : crypto.randomBytes(5).toString('hex').substr(0,9),
      } as IInviteModel;

      const invite = await InvitesService.create(inviteData);
      res.send(invite);
    }catch(error) {
        res.status(500).send(error);
    }

  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.clearUserGroup((req.user as UserProfile).id);
      res.send(req.user);
    }catch(error)
    {
        res.status(500).send(error);
    }
  }

}

export default new Controller();
