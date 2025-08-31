// This is a test route used to authenticate a filemaker user through the server DAPI and return a JWT describing them and their claims. 


import { filemakerService } from "@/lib/filemaker-service";
import { NextResponse } from "next/server";


export async function GET() {

  try {
    const JWT = await filemakerService.authenticateFileMakerUser('reloginTest', 'claude17');
    // console.log('loggin from route');
    // console.log(JWT);

    if (!JWT) {
      return NextResponse.json({
        success: false, error: 'Authentication falied'
      }, { status: 401 }
      );
    } else {
      return NextResponse.json(
        { success: true, jwt: JWT }, { status: 200 }
      );
    }

  } catch (error) {
    console.log('Error in filemaker-session/route', error);
    return NextResponse.json({ sucess: false, error: error.message || "Authentication Failed" }, { status: 500 });
  }


}